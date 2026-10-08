#!/usr/bin/env node
/**
 * ATLAS 화면 또렷함 검사 — 화면 8장(36칸 판 · 업종 · 출목표 업종별 · 출목표 흐름별 · 닮은 7곳 · 22곳 · 회사 · 일정) × 보기 5가지(PC · 휴대폰 · 휴대폰 어두운 화면 · PC 글씨 200% · 좁은 휴대폰 어두운 화면 글씨 200%)에서 여섯 숫자를 잰다.
 *   node scripts/atlas11/clarity_check.mjs --base http://localhost:8811 --pw <playwright 폴더> --label before|after [--inject]
 *   결과: reports/atlas11/clarity/<label>.json (화면·보기마다 여섯 숫자와 예시)
 *   --inject: 일부러 「내일 42 정도.」「곧 많이 오릅니다.」를 넣어 검사기가 1·2·3번을 한 개씩 더 세는지 본다(검사기 자체 시험).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {measureClarity} from './clarity/measure.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const base = arg('--base') ?? 'http://localhost:8811', pwDir = arg('--pw') ?? process.cwd(), label = arg('--label') ?? 'now', inject = process.argv.includes('--inject');
const onlyScreens = arg('--screens')?.split(','), onlyViews = arg('--views')?.split(',');
/** 화면 밖이라 그리기를 미룬 칸(content-visibility:auto)도 스크롤하면 보이는 글이므로 모두 그리게 한 뒤 잰다(CSP 안: CSSOM 으로만 바꿈) */
export async function renderAll(page) { await page.evaluate(() => { for (const el of document.querySelectorAll('*')) if (getComputedStyle(el).contentVisibility === 'auto') el.style.contentVisibility = 'visible'; }); await page.waitForTimeout(150); }
export const SCREENS = [
  // 2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
  // 2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」: 36칸 판 · 업종(불장 1위 업종) · 회사 · 일정
  // 2026-10-05 10:24 「잡스라면 36가지」 1차: 탭 「불장」(#/ · 큰 흐름) · 탭 「업종」(#/map · 73칸 판)
  // 2026-10-08 20:19 「ATLAS 개편 실행 지시서」 — 아래 탭 다섯(시장 · 돈 흐름 · 종목 · 일정 · 검증) · 시장 첫 화면 ① ~ ⑤ · 옛 「불장」은 #/hot · 옛 「돈 흐름」 그림은 #/flow/rotation
  // 2026-10-09 03:09 「ATLAS 제품 재설계 명령」 — 첫 화면 「후보 7」(#/) · 다른 후보와 비교(#/compare) · 후보 종목 화면(후보 판단 여섯 질문) · 시장은 탐색 안 #/market
  {id: 'cand', name: '후보 7', hash: '#/', wait: '.cd-page section[data-art]'},
  {id: 'compare', name: '다른 후보와 비교', hash: '#/compare', wait: '.cmp-page section[data-art]'},
  {id: 'stock-cand', name: '회사(후보 판단)', hash: board => '#/stock/' + (board?._cand ?? '005930'), wait: '.c-chart svg.lc'},
  {id: 'market', name: '시장', hash: '#/market', wait: '.mk-page [data-first="5"]'},
  {id: 'sectors', name: '업종', hash: '#/sectors', wait: '.sx-page [data-first="5"]'}, // 2026-10-09 「ATLAS 업데이트 실행 프롬프트」 4 — 아래 탭 「업종」(평균 펼치기)
  {id: 'home', name: '불장', hash: '#/hot', wait: '.h-page .hs-seg'},
  {id: 'flowwho', name: '투자자 매매', hash: '#/flow', wait: '.fw-page [data-first="1"]'},
  {id: 'flow', name: '업종 순환', hash: '#/flow/rotation', wait: '.fl-page .rt'}, // 2026-10-08 17:41 「돈에 흐름과 불장을 분리한다 · 별도에 탭을하나더 만들어라」 — 1위~3위 업종 회사 · 20:19 지시서 — 「돈 흐름」 안 「업종 순환」
  {id: 'stocks', name: '종목', hash: '#/stocks', wait: '.sk-page .sk-row'},
  {id: 'check', name: '검증', hash: '#/check', wait: '.ck-page [data-first="1"]'},
  {id: 'watch', name: '관심종목', hash: '#/watch', wait: '.wl-page [data-first="1"]'},
  {id: 'map', name: '지도', hash: '#/map', wait: '.lm-c'}, // 2026-10-06 00:21 「잡스라면 … 개선하라」 — 옛 이름 「업종 73칸」 · 맨 위 지도 한 장 + 73칸
  {id: 'land', name: '지도 갈래', hash: '#/map/f/semi', wait: '.l-grid .t-tile'}, // 2026-10-06 07:03 「왜 3단 클릭 구조가 아니지?」 — 땅을 누르면 오는 갈래 화면(반도체 · 미국 판도 같은 id)
  {id: 'industry', name: '업종', hash: board => '#/i/' + (board?.hot?.items?.[0]?.id ?? board?.groups?.[0]?.id ?? ''), wait: '.b-card .spark'},
  // 2026-10-04 22:12 「에볼루션에 바카라 출몰표 한곳에 모여 있는것도 … 추가로 더 만들어」: 출목표 한 판 — 업종별(처음) · 흐름별(단추를 눌러서)
  // 2026-10-05 365곳: 출목표 칸은 조금씩 붙인다 — 다 붙인 뒤(data-ready) 잰다
  // 2026-10-05 11:36 「출목표 탭을 클릭하면 가장 상승한순으로」 → 「모든 배치가 가장 많이 상승한순으로」: 처음 = 오른 순 · 업종별 · 흐름별은 단추를 눌러서
  // 2026-10-05 12:28 「그 안에 탭을 더」: 묶는 법마다 첫 탭을 잰다(탭끼리 칸 모양은 같고 검사기 browser_check 가 탭을 모두 눌러 셈)
  {id: 'road', name: '출목표(오른 순)', hash: '#/road', wait: '.f-body[data-mode="rise"][data-ready] .f-tile'},
  {id: 'road-ind', name: '출목표(업종별)', hash: '#/road', wait: '.f-body[data-ready] .f-tile', settle: async page => { await page.locator('.f-seg-b[data-mode="ind"]').click(); await page.waitForSelector('.f-body[data-mode="ind"][data-ready] .f-tile'); }},
  {id: 'road-sun', name: '출목표(태양)', hash: '#/road', wait: '.f-body[data-ready] .f-tile', settle: async page => { await page.locator('.f-seg-b[data-mode="sun"]').click(); await page.waitForSelector('.f-body[data-mode="sun"][data-ready] .f-tile'); }}, // 2026-10-05 14:40 「태양이 있는 곳을 한 곳으로 모아줘」
  {id: 'road-flow', name: '출목표(흐름별)', hash: '#/road', wait: '.f-body[data-ready] .f-tile', settle: async page => { await page.locator('.f-seg-b[data-mode="flow"]').click(); await page.waitForSelector('.f-body[data-mode="flow"][data-ready] .f-tile'); }},
  // 2026-10-05 05:07 「해」: 탭 다섯 — 「예비」(불장 닮은 7곳 · 저녁 7시 들고 남) · 「22곳」(불장 밖에서 오름 상위)
  {id: 'similar', name: '예비', hash: '#/similar', wait: '.sm-row, .s-page .b-note'},
  {id: 'rise', name: '오름 상위', hash: '#/rise', wait: '.nc-row, .r-page .muted'},
  {id: 'stock', name: '회사', hash: '#/stock/005930', wait: '.c-chart svg.lc'},
  {id: 'agenda', name: '일정', hash: '#/agenda', wait: '.a-days, .b-box'},
  // 2026-10-05 20:24 「아틀란스에서 종목을 찾는 기능을 넣어라」: 아래 탭 「찾기」 — 이름 두 글자를 넣은 화면(한국 · 미국 판 줄이 함께)을 잰다
  {id: 'find', name: '종목 찾기', hash: '#/stocks', wait: '.sk-page .fd-in', settle: async page => { await page.locator('.sk-page .fd-in').fill('반도'); await page.waitForTimeout(250); }}, // 옛 「찾기」 탭은 「종목」의 찾기 칸(2026-10-08 지시서 7)
  {id: 'log', name: '기록', hash: '#/log', wait: '.lg-page .lg-item'}, // 2026-10-06 16:10 「… 기록 하는 탭」 — 아래 탭 여섯째(업데이트 · 자료 변경 날짜)
  // 2026-10-07 00:49 「이대로 사이트에 올려줘」: 아래 탭 일곱째 「처음」(찍은 다섯 · 미국 판은 「언제부터」만) — 맨 아래 접힌 「ATLAS가 하지 않는 일」도 펼쳐서 잰다
  {id: 'guide', name: '한국 주식시장 안내', hash: '#/guide', wait: '.gd-page .gd-row'}, // 2026-10-07 05:31 「외국인들 … 한국 주식시장을 제대로 알수 있게」
  {id: 'long', name: '500만 원을 오래 들고 있었다면', hash: '#/long', wait: '.lt-page .lt-row'}, // 2026-10-07 05:27
  {id: 'korea', name: '한국 주식시장은 몇 위인가', hash: '#/korea', wait: '.kr-page .kr-row'}, // 2026-10-07 05:29
  {id: 'learn', name: '같은 평균, 다른 구조(읽는 법 연습)', hash: '#/learn', wait: '.lr-page .dc-row'}, // 2026-10-09 셋째 개정본 0-E
  {id: 'start', name: '처음', hash: '#/start', wait: '.st-page .st-row, .st-page .st-wait', settle: async page => { await page.evaluate(() => document.querySelectorAll('.st-page details').forEach(d => { d.open = true; })); }}, // 접힌 「기준 · 숫자 자세히」(02:39 「아주 효율적으로 해」)도 펼쳐서 잰다
];
/** 화면 주소 — 업종 화면은 판(board.json)에 따라 정해진다 */
export const screenHash = (s, board) => typeof s.hash === 'function' ? s.hash(board) : s.hash;
export const VIEWS = [
  {id: 'pc', name: 'PC', viewport: {width: 1280, height: 800}},
  {id: 'mobile', name: '휴대폰', viewport: {width: 390, height: 844}, mobile: true},
  {id: 'mobile-dark', name: '휴대폰 어두운 화면', viewport: {width: 390, height: 844}, mobile: true, dark: true},
  {id: 'pc-200', name: 'PC 글씨 200%', viewport: {width: 1280, height: 800}, font: 4},
  // 10/01 03시 추가: 사장님 휴대폰(어두운 화면 · 큰 글씨)에서 회사 이름이 잘린 뒤 — 좁은 휴대폰(360)·어두운 화면·글씨 200% 를 한꺼번에(가장 빡빡한 경우)
  {id: 'mobile-dark-200', name: '좁은 휴대폰 어두운 화면 글씨 200%', viewport: {width: 360, height: 780}, mobile: true, dark: true, font: 4},
];
/** 7번째 숫자 「잘린 글자」 — 여섯 숫자의 합과 섞지 않고 따로 센다(목표 0) */
export const TRUNC_KEY = 'truncated';
export const KEYS = ['relDays', 'vague', 'bareNumbers', 'graphable', 'lowContrast', 'decoColors'];

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const {chromium} = createRequire(path.join(pwDir, 'package.json'))('playwright');
  const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? undefined});
  const out = {schema: 'atlas11-clarity-1', label, at: new Date().toISOString(), base, keys: KEYS, views: {}, inject: null};
  const board = await (await fetch(base + '/data/atlas11/view/board.json')).json().catch(() => null);
  const lensC = await (await fetch(base + '/data/atlas11/view/lens.json')).json().catch(() => null); if (board && lensC?.cand?.items?.[0]) board._cand = lensC.cand.items[0].code; // 후보 판단 칸이 있는 회사 화면(첫 후보)
  for (const v of (inject ? VIEWS.slice(0, 1) : VIEWS.filter(x => !onlyViews || onlyViews.includes(x.id)))) {
    const ctx = await browser.newContext({viewport: v.viewport, isMobile: !!v.mobile, hasTouch: !!v.mobile, colorScheme: v.dark ? 'dark' : 'light', locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    if (v.font) await ctx.addInitScript(step => { try { localStorage.setItem('atlas11:font', String(step)); } catch {} }, v.font);
    const page = await ctx.newPage();
    out.views[v.id] = {};
    for (const s of (inject ? SCREENS.filter(x => x.id === 'home') : SCREENS.filter(x => !onlyScreens || onlyScreens.includes(x.id)))) {
      await page.goto(base + '/' + screenHash(s, board), {waitUntil: 'networkidle'});
      await page.waitForSelector(s.wait, {timeout: 15000}).catch(() => { console.log('기다림 실패', s.id, s.wait); });
      if (s.settle) await s.settle(page);
      await page.waitForTimeout(700);
      await renderAll(page);
      const m = await page.evaluate(measureClarity);
      // 헤드라인 숫자를 눌러 연 출처·기준 시각 칸도 같은 잣대(1~3번)로 잰다 — 눌러야 보이는 곳도 무너지면 안 된다
      const opened = await page.evaluate(() => { const b = [...document.querySelectorAll('.hl-num')]; for (const x of b) if (x.getAttribute('aria-expanded') !== 'true') x.click(); return b.length; });
      if (opened) { await page.waitForTimeout(120); const src = await page.evaluate(measureClarity, {roots: ['.hl-src'], refTime: false}); m.source = {panels: opened, relDays: src.relDays, vague: src.vague, bareNumbers: src.bareNumbers, formatDates: src.formatDates, samples: {relDays: src.samples.relDays, vague: src.samples.vague, bareNumbers: src.samples.bareNumbers, formatDates: src.samples.formatDates}}; await page.evaluate(() => { for (const x of document.querySelectorAll('.hl-num[aria-expanded="true"]')) x.click(); }); }
      else m.source = {panels: 0};
      // 예측 표시(data-forecast-date)는 없어야 한다(2026-10-04 15:37 「표현하지 마라」)
      m.forecastMarks = await page.evaluate(() => document.querySelectorAll('[data-forecast-date]').length);
      out.views[v.id][s.id] = m;
      if (inject) {
        await page.evaluate(() => { const box = document.createElement('section'); box.className = 'card'; box.innerHTML = '<p>내일 42 정도.</p><p>곧 많이 오릅니다.</p>'; document.getElementById('main').prepend(box); });
        const after = await page.evaluate(measureClarity);
        const delta = Object.fromEntries(['relDays', 'vague', 'bareNumbers'].map(k => [k, after[k] - m[k]]));
        out.inject = {screen: s.id, planted: ['내일 42 정도.', '곧 많이 오릅니다.'], delta, caught: delta.relDays >= 1 && delta.vague >= 1 && delta.bareNumbers >= 1};
        console.log('inject', JSON.stringify(out.inject));
      }
    }
    await ctx.close();
  }
  await browser.close();
  // 표로 보이기
  const marks = Object.values(out.views).flatMap(sc => Object.values(sc)).reduce((s, m) => s + (m.forecastMarks ?? 0), 0);
  console.log(`예측 표시: ${marks}개(0 이어야 함)`);
  if (marks) process.exitCode = 1;
  for (const [vid, screens] of Object.entries(out.views)) {
    console.log(`\n[${vid}] ` + ['화면', ...KEYS, '합', '7 잘린 글자', '(덤)날짜모양', '글조각', '첫화면', '출처칸 1·2·3·날짜'].join(' | '));
    for (const [sid, m] of Object.entries(screens)) console.log(`${sid} | ` + KEYS.map(k => m[k]).join(' | ') + ` | ${KEYS.reduce((s, k) => s + m[k], 0)} | ${m.truncated ?? '—'}${m.truncated ? ' (' + (m.samples?.truncated ?? []).slice(0, 3).join(' / ') + ')' : ''} | ${m.formatDates} | ${m.sentences.length} | ${m.firstView.length} | ${m.source?.panels ? [m.source.relDays, m.source.vague, m.source.bareNumbers, m.source.formatDates].join('·') : '칸 없음'}`);
  }
  const dir = path.join(process.cwd(), 'reports/atlas11/clarity'); await fs.mkdir(dir, {recursive: true});
  await fs.writeFile(path.join(dir, `${inject ? 'inject' : label}.json`), JSON.stringify(out, null, 1));
  console.log('\nsaved', path.join('reports/atlas11/clarity', `${inject ? 'inject' : label}.json`));
}

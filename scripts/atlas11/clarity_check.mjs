#!/usr/bin/env node
/**
 * ATLAS 화면 또렷함 검사 — 화면 8장(7장 + 2026-10-02 게임) × 보기 4가지(PC · 휴대폰 · 휴대폰 어두운 화면 · PC 글씨 200%)에서 여섯 숫자를 잰다.
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
  // 2026-10-02 01:34 사장님 승인 3차 디자인: 첫 화면 「내일」 = 52점 원 + 이야기 다섯 장면 — 원이 그려지면 이야기를 건너뛰어(「건너뛰기」) 끝 장면과 목록을 잰다
  // 2026-10-02 04:16 사장님 「이때로 돌아가」(2차 화면): 이야기를 꺼 두어 건너뛰기 단추가 없다 — 단추가 있을 때만 누르고(없으면 3초를 기다리지 않음), 점이 다 나타날 때까지(52 × 14ms + 0.5초) 기다린 뒤 잰다
  // 2026-10-02 14:01 사장님 「동그라미 천천히 나오고 회사 이름 나오게 해봐」: 점이 하나씩 나오는 데 22초쯤 — 다 나온 모습(움직임 줄이기와 같은 모습)을 잰다
  {id: 'forecast', name: '내일', hash: '#/forecast', wait: '.t-ring .t-dot, .wl-row, .stock-card', settle: async page => { const skip = page.locator('#t-ctl[data-mode="skip"]'); if (await skip.count()) await skip.click({timeout: 3000}).catch(() => {});
    if (await page.locator('.t-page[data-roll="playing"]').count()) { await page.emulateMedia({reducedMotion: 'reduce'}); await page.reload({waitUntil: 'networkidle'}); await page.waitForSelector('.t-ring .t-dot'); await page.emulateMedia({reducedMotion: 'no-preference'}); }
    await page.waitForTimeout(600); }},
  {id: 'stock', name: '종목 상세', hash: '#/stock/005930', wait: 'svg.chart'},
  // 「내일 하루만」(2026-10-02 사장님 명령)이면 1만원 비교는 꺼 둠 — 그래프 대신 「꺼 둠」 한 줄을 기다린다
  {id: 'race', name: '1만원 비교', hash: '#/race', wait: 'svg.chart, [data-off="race"]'},
  {id: 'scores', name: '성적', hash: '#/scores', wait: 'svg.lc, .timeline, .card h2'},
  {id: 'evolution', name: '진화', hash: '#/evolution', wait: 'svg.evo-chart'},
  {id: 'records', name: '기록', hash: '#/records', wait: 'svg.lc, .sentences li'},
  {id: 'status', name: '자료 상태', hash: '#/status', wait: 'svg.lc, .fgrid'},
  // 2026-10-02 05:58 사장님 「aaa7377에 연결해야 한다」: 아틀라스 게임(따로 된 쪽 game/) — 카드가 그려지고 판화가 찍힐 때까지 기다린 뒤 잰다
  {id: 'game', name: '게임', hash: 'game/', wait: '#main .card', settle: async page => { await page.waitForTimeout(900); }},
];
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
  for (const v of (inject ? VIEWS.slice(0, 1) : VIEWS.filter(x => !onlyViews || onlyViews.includes(x.id)))) {
    const ctx = await browser.newContext({viewport: v.viewport, isMobile: !!v.mobile, hasTouch: !!v.mobile, colorScheme: v.dark ? 'dark' : 'light', locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    if (v.font) await ctx.addInitScript(step => { try { localStorage.setItem('atlas11:font', String(step)); } catch {} }, v.font);
    const page = await ctx.newPage();
    out.views[v.id] = {};
    for (const s of (inject ? SCREENS.filter(x => x.id === 'evolution') : SCREENS.filter(x => !onlyScreens || onlyScreens.includes(x.id)))) {
      await page.goto(base + '/' + s.hash, {waitUntil: 'networkidle'});
      await page.waitForSelector(s.wait, {timeout: 15000}).catch(() => { console.log('기다림 실패', s.id, s.wait); });
      if (s.settle) await s.settle(page);
      await page.waitForTimeout(700);
      await renderAll(page);
      const m = await page.evaluate(measureClarity);
      // 헤드라인 숫자를 눌러 연 출처·기준 시각 칸도 같은 잣대(1~3번)로 잰다 — 눌러야 보이는 곳도 무너지면 안 된다
      const opened = await page.evaluate(() => { const b = [...document.querySelectorAll('.hl-num')]; for (const x of b) if (x.getAttribute('aria-expanded') !== 'true') x.click(); return b.length; });
      if (opened) { await page.waitForTimeout(120); const src = await page.evaluate(measureClarity, {roots: ['.hl-src'], refTime: false}); m.source = {panels: opened, relDays: src.relDays, vague: src.vague, bareNumbers: src.bareNumbers, formatDates: src.formatDates, samples: {relDays: src.samples.relDays, vague: src.samples.vague, bareNumbers: src.samples.bareNumbers, formatDates: src.samples.formatDates}}; await page.evaluate(() => { for (const x of document.querySelectorAll('.hl-num[aria-expanded="true"]')) x.click(); }); }
      else m.source = {panels: 0};
      // 내일만: 화면의 전망 표시(data-forecast-date) 가운데 내일(manifest.futureDates[0])이 아닌 것의 수 — 0 이어야 한다
      // 화면 묶음 주소는 사이트 맨 위(base) 기준으로 — 게임처럼 다른 쪽(game/)에서 재도 같은 manifest 를 읽는다
      m.tomorrowOnly = await page.evaluate(async b => { const mf = await (await fetch(b + '/data/atlas11/view/manifest.json')).json(); const t = mf.futureDates[0], all = [...document.querySelectorAll('[data-forecast-date]')].map(e => e.getAttribute('data-forecast-date')); return {on: Boolean(mf.tomorrowOnly), tomorrow: t, marks: all.length, other: all.filter(d => d !== t).length}; }, base).catch(() => null);
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
  const otherMarks = Object.values(out.views).flatMap(sc => Object.values(sc)).reduce((s, m) => s + (m.tomorrowOnly?.other ?? 0), 0);
  out.tomorrowOnly = {on: Object.values(out.views).some(sc => Object.values(sc).some(m => m.tomorrowOnly?.on)), otherForecastMarks: otherMarks};
  console.log(`내일만: ${out.tomorrowOnly.on ? '켜짐' : '꺼짐(옛 20거래일 화면)'} · 내일 말고의 전망 표시 ${otherMarks}개`);
  if (out.tomorrowOnly.on && otherMarks) process.exitCode = 1;
  for (const [vid, screens] of Object.entries(out.views)) {
    console.log(`\n[${vid}] ` + ['화면', ...KEYS, '합', '7 잘린 글자', '(덤)날짜모양', '글조각', '첫화면', '출처칸 1·2·3·날짜'].join(' | '));
    for (const [sid, m] of Object.entries(screens)) console.log(`${sid} | ` + KEYS.map(k => m[k]).join(' | ') + ` | ${KEYS.reduce((s, k) => s + m[k], 0)} | ${m.truncated ?? '—'}${m.truncated ? ' (' + (m.samples?.truncated ?? []).slice(0, 3).join(' / ') + ')' : ''} | ${m.formatDates} | ${m.sentences.length} | ${m.firstView.length} | ${m.source?.panels ? [m.source.relDays, m.source.vague, m.source.bareNumbers, m.source.formatDates].join('·') : '칸 없음'}`);
  }
  const dir = path.join(process.cwd(), 'reports/atlas11/clarity'); await fs.mkdir(dir, {recursive: true});
  await fs.writeFile(path.join(dir, `${inject ? 'inject' : label}.json`), JSON.stringify(out, null, 1));
  console.log('\nsaved', path.join('reports/atlas11/clarity', `${inject ? 'inject' : label}.json`));
}

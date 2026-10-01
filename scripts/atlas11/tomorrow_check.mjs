#!/usr/bin/env node
/**
 * ATLAS 11 · 「내일 하루만」 세기 — 사장님 명령(2026-10-02 00:08 KST) 10·11·12번
 *   「화면·계산·그래프를 따로 살펴라 · 셋마다 남은 '내일 말고' 예측 수를 적어라 · 없으면 없다고 보고해라」
 *
 *   node scripts/atlas11/tomorrow_check.mjs --root DIR [--base http://localhost:PORT --pw /opt/node-tools]
 *
 * 내일 = 최신 발행본의 futureDates[0] (기준일 다음 거래일).
 * 계산  : 최신 발행본(public/data/atlas11/forecast.json) — 출발행이 아닌 행 중 날짜가 내일이 아닌 것 · 대표 시나리오의 미래 점 ·
 *         직전 발행본 복사(previous)의 내일 아닌 미래 행 · 그 발행본 CSV 의 내일 아닌 전망 행
 * 화면  : 화면 묶음(public/data/atlas11/view/**) 안 내일 뒤 날짜 값(거래일 달력·발행 끝날 설정은 따로 셈) +
 *         열린 사이트의 탭마다(1280·390 폭) 그래프 밖 [data-forecast-date] 중 내일 아닌 것 + 거래일 달력 칸 밖에 보이는 내일 뒤 날짜 글자
 * 그래프: 열린 사이트의 svg 안 [data-forecast-date] 중 내일 아닌 것 + svg 안에 보이는 내일 뒤 날짜 글자
 * 이 검사기는 화면·계산을 만든 일꾼과 따로 썼다(짓는 쪽 검사기를 쓰지 않음).
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const arg = (name, d = null) => { const i = process.argv.indexOf(name); return i < 0 ? d : process.argv[i + 1]; };
const root = path.resolve(arg('--root', '.')), base = arg('--base'), pw = arg('--pw', '/opt/node-tools');
const readJSON = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const pub = readJSON('public/data/atlas11/forecast.json');
const tomorrow = pub.futureDates[0];
const out = {tomorrow, forecastId: pub.forecastId, issuedAt: pub.issuedAt, actualAsOf: pub.actualAsOf, publicationHorizon: pub.horizon, compute: {}, screen: {}, graph: {}};

// ── 계산 ──
let rows = 0, scenarioPoints = 0, previousRows = 0;
for (const a of pub.assets) {
  rows += (a.rows ?? []).filter(r => !r.anchor && r.date !== tomorrow).length;
  if (a.scenario?.prices) scenarioPoints += Math.max(0, a.scenario.prices.length - 1);
  previousRows += (a.previous?.rows ?? []).filter(r => r.date > (a.previous.actualAsOf ?? '') && r.date !== tomorrow).length;
}
let csvRows = 0, csvFiles = 0;
const csvDir = path.join(root, 'public/downloads/atlas11', pub.forecastId);
if (fs.existsSync(csvDir)) for (const f of fs.readdirSync(csvDir).filter(f => f.endsWith('.csv'))) {
  csvFiles++;
  for (const line of fs.readFileSync(path.join(csvDir, f), 'utf8').split(/\r?\n/).slice(1).filter(Boolean)) { const [date, kind] = line.split(','); if (kind === '전망' && date !== tomorrow) csvRows++; }
}
out.compute = {nonTomorrowRows: rows, scenarioFuturePoints: scenarioPoints, previousCopyNonTomorrowRows: previousRows, csvFiles, csvNonTomorrowRows: csvRows,
  total: rows + scenarioPoints + previousRows + csvRows};

// ── 화면 묶음(화면이 읽는 자료) ──
const viewDir = path.join(root, 'public/data/atlas11/view');
let bundleAfter = 0; const calendarAfter = [], bundleHits = [];
const CALENDAR_KEYS = /calendar|upcomingSessions|holidays|notices|coverageEnd|publishEnd|verifiedThrough|checkedAt/;
function walk(v, keyPath, file) {
  if (typeof v === 'string') { if (DATE.test(v.slice(0, 10)) && v.slice(0, 10) > tomorrow) { if (CALENDAR_KEYS.test(keyPath)) calendarAfter.push(`${file}:${keyPath}`); else { bundleAfter++; if (bundleHits.length < 12) bundleHits.push(`${file}:${keyPath}=${v}`); } } return; }
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${keyPath}[${i}]`, file)); return; }
  if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (DATE.test(k) && k > tomorrow && !CALENDAR_KEYS.test(keyPath)) { bundleAfter++; if (bundleHits.length < 12) bundleHits.push(`${file}:${keyPath}.${k}`); } walk(x, `${keyPath}.${k}`, file); }
}
let viewFiles = 0;
if (fs.existsSync(viewDir)) for (const f of fs.readdirSync(viewDir, {recursive: true}).filter(f => f.endsWith('.json'))) { viewFiles++; walk(JSON.parse(fs.readFileSync(path.join(viewDir, f), 'utf8')), '', f); }
out.screen.bundle = {files: viewFiles, datesAfterTomorrow: bundleAfter, examples: bundleHits, calendarDatesAfterTomorrow: calendarAfter.length, calendarNote: '거래일 달력·발행 끝날 설정 — 전망이 아님(따로 셈)'};

// ── 사이트 묶음(dist)에 실린 파일: 여러 날 전망 CSV · 20거래일 발행본 · 옛 화면 캡처 ──
const dist = path.join(root, 'dist');
if (fs.existsSync(dist)) {
  let multiDayCsv = 0, csvTotal = 0, multiDayPublications = 0;
  const files = fs.readdirSync(dist, {recursive: true}).map(String);
  for (const f of files.filter(f => f.endsWith('.csv') && !f.includes('/ledger/'))) {
    csvTotal++;
    const lines = fs.readFileSync(path.join(dist, f), 'utf8').split(/\r?\n/).filter(Boolean);
    const forecastDates = lines.slice(1).map(l => l.split(',')).filter(c => c[1] === '전망').map(c => c[0]);
    if (forecastDates.length > 1) multiDayCsv++;
  }
  for (const f of files.filter(f => /^data\/atlas11\/[^/]+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(dist, f), 'utf8')); if (j?.horizon > 1 || j?.schema === 'atlas11-archive-reconstruction-1') multiDayPublications++; }
  let evidence = null; try { evidence = JSON.parse(fs.readFileSync(path.join(dist, 'docs/evidence/browser-report.json'), 'utf8')); } catch {}
  out.screen.distFiles = {csvFiles: csvTotal, multiDayCsvFiles: multiDayCsv, multiDayPublicationFiles: multiDayPublications, evidenceScreenshots: files.filter(f => f.startsWith('docs/evidence/') && f.endsWith('.png')).length, evidenceFromTomorrowMode: evidence ? evidence.tomorrowOnly === true : null};
}

// ── 열린 사이트(화면·그래프) ──
if (base) {
  const require = createRequire(path.join(pw, 'node_modules', 'x.js'));
  const {chromium} = require('playwright');
  const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? undefined});
  // 2026-10-02 05:58 사장님 「aaa7377에 연결해야 한다」: 아틀라스 게임(game/)도 같은 잣대(전망 표시는 내일만 · 내일 뒤 날짜 글자 0)로 본다
  const routes = ['#/forecast', '#/stock/005930', '#/race', '#/scores', '#/evolution', '#/status', '#/records', 'game/'];
  const pages = [];
  for (const width of [1280, 390]) {
    const ctx = await browser.newContext({viewport: {width, height: 900}, bypassCSP: true});
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
    for (const r of routes) {
      await page.goto(base + '/' + r, {waitUntil: 'networkidle'});
      await page.waitForTimeout(700);
      // 닫힌 칸까지 모두 연다(숨은 전망도 센다)
      await page.evaluate(() => { for (const d of document.querySelectorAll('details')) d.open = true; });
      await page.waitForTimeout(150);
      const res = await page.evaluate(({tomorrow}) => {
        const y0 = Number(tomorrow.slice(0, 4));
        const marks = [...document.querySelectorAll('#main [data-forecast-date]')];
        const inSvg = el => Boolean(el.closest('svg'));
        const tally = list => ({tomorrow: list.filter(el => el.dataset.forecastDate === tomorrow).length, other: list.filter(el => el.dataset.forecastDate !== tomorrow).length, otherDates: [...new Set(list.filter(el => el.dataset.forecastDate !== tomorrow).map(el => el.dataset.forecastDate))].slice(0, 8)});
        // 보이는 글자 속 날짜(2026-10-06 · 10월 6일 · 10/6) 중 내일 뒤
        const norm = (m, d) => `${y0}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const after = {inSvg: [], outside: [], calendar: 0};
        const walker = document.createTreeWalker(document.querySelector('#main') ?? document.body, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const t = n.textContent; if (!t || !t.trim()) continue;
          const el = n.parentElement; if (!el || el.closest('script,style')) continue;
          const found = [];
          for (const m of t.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)) found.push(`${m[1]}-${m[2]}-${m[3]}`);
          for (const m of t.matchAll(/(1[0-2]|[1-9])월\s*([12]\d|3[01]|[1-9])일/g)) found.push(norm(m[1], m[2]));
          for (const m of t.replace(/\d{4}-\d{2}-\d{2}/g, '').matchAll(/(?<![\d.])(1[0-2]|[1-9])\/([12]\d|3[01]|[1-9])(?![\d/])/g)) found.push(norm(m[1], m[2]));
          for (const d of found) if (d > tomorrow) { if (el.closest('[data-calendar]')) after.calendar++; else (el.closest('svg') ? after.inSvg : after.outside).push(`${d} «${t.trim().slice(0, 40)}»`); }
        }
        return {screenMarks: tally(marks.filter(el => !inSvg(el))), graphMarks: tally(marks.filter(inSvg)), svgCount: document.querySelectorAll('#main svg').length, afterOutside: after.outside.length, afterInSvg: after.inSvg.length, afterCalendar: after.calendar, examples: [...after.outside, ...after.inSvg].slice(0, 6), offNote: Boolean(document.querySelector('#main .off-note, #main [data-off]'))};
      }, {tomorrow});
      pages.push({width, route: r, ...res, errors: errors.splice(0)});
    }
    await ctx.close();
  }
  await browser.close();
  const sum = (f) => pages.reduce((s, p) => s + f(p), 0);
  out.screen.site = {pages: pages.length, nonTomorrowMarks: sum(p => p.screenMarks.other), tomorrowMarks: sum(p => p.screenMarks.tomorrow), datesAfterTomorrowOutsideCalendar: sum(p => p.afterOutside), calendarDates: sum(p => p.afterCalendar), pageErrors: sum(p => p.errors.length)};
  out.graph = {svgs: sum(p => p.svgCount), nonTomorrowMarks: sum(p => p.graphMarks.other), tomorrowMarks: sum(p => p.graphMarks.tomorrow), datesAfterTomorrowInSvg: sum(p => p.afterInSvg)};
  out.pages = pages.map(p => ({width: p.width, route: p.route, screenOther: p.screenMarks.other, screenTomorrow: p.screenMarks.tomorrow, graphOther: p.graphMarks.other, graphTomorrow: p.graphMarks.tomorrow, svgs: p.svgCount, afterOutside: p.afterOutside, afterInSvg: p.afterInSvg, examples: p.examples, offNote: p.offNote, errors: p.errors}));
}
out.screen.total = (out.screen.bundle.datesAfterTomorrow ?? 0) + (out.screen.site ? out.screen.site.nonTomorrowMarks + out.screen.site.datesAfterTomorrowOutsideCalendar : 0) + (out.screen.distFiles ? out.screen.distFiles.multiDayCsvFiles + out.screen.distFiles.multiDayPublicationFiles + (out.screen.distFiles.evidenceScreenshots && out.screen.distFiles.evidenceFromTomorrowMode === false ? out.screen.distFiles.evidenceScreenshots : 0) : 0);
out.graph.total = out.graph.nonTomorrowMarks != null ? out.graph.nonTomorrowMarks + out.graph.datesAfterTomorrowInSvg : null;
console.log(JSON.stringify(out, null, 1));

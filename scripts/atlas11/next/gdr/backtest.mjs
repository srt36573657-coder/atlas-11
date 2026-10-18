#!/usr/bin/env node
// 고도리 지난 성적 bt-v1 — 같은 규칙(pick2.mjs selectOn)으로 거래일마다 골라 한 달(20거래일) · 석 달(60거래일) 뒤를
//   같은 날 모든 회사(baseline.mjs gb-v1) · 코스피와 견줌(명령 [8] 3 「지난 3년 거래일마다 같은 규칙으로 고르고 … 그날 알 수 있던 결산만 …
//   한 줄을 「어떻게 골랐나」 맨 위에 … 나빠도 싣는다」 · 일꾼 G2b — G2 를 이어받음)
// 쓰는 법: nice -n 19 node scripts/atlas11/next/gdr/backtest.mjs [--bundle <bundle.json.gz>] [--site site/atlas/data] [--out site/next/data/gdr-back.json]
//          [--from 250] [--side 1(참고 줄: 손해 없는 해 수)] [--pit 6(그날 것만 시험 날 수 · 0 = 안 함)] [--picker <pick2.mjs>] [--check(쓰지 않고 보기만)]
// 규칙 bt-v1:
//  ① 고른 날 k = 250 ~ 마지막 − 20(앞 250날 = 고르는 문이 1년 값을 봄 · 뒤 20날 = 한 달 뒤 값이 있어야 함) · 석 달은 마지막 − 60 까지 · 채우지 않음
//  ② 날마다 selectOn(data, k, {backtest: true}) 한 번 — 부른 수 = 고른 날 수 · 판 이름 = pick2 의 VERSION
//  ③ 고도리 칸 오름 = 고른 곳마다(끝 날 종가 ÷ k 날 종가 − 1)의 평균(같은 돈) · 규칙 비중 오름 = Σ(비중 ÷ 100 × 오름)(현금은 0)
//     끝 값 규칙은 baseline.mjs 와 같음(거래가 멈춘 곳은 마지막 종가 = stale) · 고른 곳 하나라도 값이 없으면 그날은 「?」(null) · 고른 곳이 없으면 현금 0%
//  ④ 견줄 것: 모든 회사 = 같은 날 거래된 회사 주식 모두에 같은 돈(평균) — 바구니는 바구니끼리(가운데값은 한 회사 꼴이라 오른쪽으로 긴 꼴에서
//     바구니에 늘 유리 → 참고 칸 winAllMedian 만) · 코스피 = 지수 종가 오름 · 이긴 날 = 고도리 칸 오름 > 견줄 것 오름(같으면 진 날)
//  ⑤ 셀 수 있는 창 = 회사 주식 절반 넘게 실제 결산 세 해(손해 없는 해 3)를 쓸 수 있게 된 첫 날(결산 달 M 의 넉 달째 1일 · fyReady)부터 끝까지 —
//     고른 결과를 보지 않고 자료만으로 정함 · 그 뒤 현금 날도 모두 넣음(빼고 고르지 않음) · 그 앞 날은 「규칙을 못 셈」으로 수만 셈(everyDay 칸은 모두)
//     참고 줄(--side n)은 이익 · 매출이 늘었나에 두 해가 있어야 해 max(n, 2) 해가 모인 날부터
//  ⑥ 겹침: 날마다 센 한 달은 앞뒤 날과 19날씩 겹침 → 셀 수 있는 창 첫 날부터 한 달마다 · 석 달마다 띄어 센 것(nonOverlap)도 함께
//  ⑦ 그날 알 수 있던 것만(검은 상자): 표본 날마다 그날 뒤 일봉 줄을 자르고, 그날 아직 못 쓰던 결산 칸(결산 달 M 의 넉 달째 1일 전 ·
//     앞날 예상 칸 isConsensus = Y) · 받은 때(2026-10-14) 요약 칸(값 · 시총 · PER · PBR · 52주 · 목록 시총 listValue · 그날 못 쓰던 EPS · BPS)을
//     엉뚱한 값(-999,999 · 시총 1)으로 바꾼 모음으로 다시 불러 고른 곳 · 비중 · 현금이 같은지(pit) — 바탕 비교도 그날 뒤를 자른 값과 맞댐
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {loadBaseline, readBundle, DEFAULT_BUNDLE, BASELINE_VERSION} from './baseline.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const BACKTEST_VERSION = 'bt-v1';
export const HOLDS = {m1: 20, m3: 60};
export const NOT_EVAL = new Set(['years']); // 규칙을 셀 수 없던 날의 까닭(pick2 counts.why)
const R6 = x => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 1e6) / 1e6);
const med = xs => { const a = xs.slice().sort((x, y) => x - y), m = a.length; return m ? (m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2) : null; };

/** selectOn 결과 → 견줄 꼴(고른 곳 번호 · 비중 · 현금 · 까닭) */
export const normSel = res => ({picks: (res?.picks ?? []).map(p => ({code: String(p.code), w: Number(p.w)})), cash: res?.cash ?? null, why: res?.counts?.why ?? null});
export const sameSel = (a, b) => JSON.stringify(normSel(a)) === JSON.stringify(normSel(b));
export const evaluable = sel => { const w = sel?.why ?? sel?.counts?.why; const ws = Array.isArray(w) ? w : w == null ? [] : String(w).split(','); return !((sel?.picks?.length ?? 0) === 0 && ws.some(x => NOT_EVAL.has(String(x).trim()))); };
/** 결산 해가 모인 날 — 회사 주식마다 실제 결산(예상 칸 뺌) need 해째를 쓸 수 있게 된 날(결산 달 M 의 넉 달째 1일) · 날마다 그 수
 *  창 첫 날 = 회사 주식 절반 넘게 need 해가 모인 첫 날(고른 결과를 보지 않고 자료만으로 정함 — 좋은 날을 골라 시작하지 않게) */
export function fyReady(B, codes, days, need) {
  const at = [];
  for (const c of codes) {
    const f = B?.stocks?.[c]?.finance; let keys = [];
    if (f?.kind === 'json' && f.text) { try { keys = (JSON.parse(f.text).financeInfo?.trTitleList ?? []).filter(t => t?.isConsensus === 'N' && /^\d{6}$/.test(String(t.key))).map(t => String(t.key)); } catch { keys = []; } }
    const ds = [...new Set(keys)].map(k => { let y = +k.slice(0, 4), m = +k.slice(4, 6) + 4; while (m > 12) { m -= 12; y++; } return `${y}-${String(m).padStart(2, '0')}-01`; }).sort();
    at.push(ds.length >= need ? ds[need - 1] : null);
  }
  const sorted = at.filter(Boolean).sort();
  let j = 0; const count = days.map(d => { while (j < sorted.length && sorted[j] <= d) j++; return j; });
  return {need, count, of: codes.length, noFinance: at.filter(x => x === null).length};
}

/** 한 날 · 한 기간 — 고도리 칸 오름 · 규칙 비중 오름 · 모든 회사 · 코스피 */
export function dayReturn(bl, sel, k, hold) {
  const e = bl.endOf(k, hold);
  if (e < 0) return null;
  const all = bl.allCompanies(k, hold), kp = bl.kospi(k, hold), picks = sel?.picks ?? [];
  let sum = 0, rule = 0, unknown = 0, stale = 0, jump = 0;
  for (const p of picks) {
    const s = bl.stockReturn(p.code, k, hold);
    if (!s) { unknown++; continue; }
    sum += s.r; rule += (p.w / 100) * s.r;
    if (s.stale) stale++;
    if (s.jump) jump++;
  }
  const basket = unknown ? null : picks.length ? sum / picks.length : 0;
  return {k, e, n: picks.length, basket, rule: unknown ? null : rule, unknown, stale, jump,
    allMean: all?.mean ?? null, allMedian: all?.median ?? null, allN: all?.n ?? null, kospi: kp.r, beat: basket === null ? null : (bl.beats(k, hold, basket)?.share ?? null)};
}

/** 여러 날 줄 → 한 줄 요약(key = 'basket' 고도리 칸 같은 돈 · 'rule' 규칙 비중) */
export function summarize(rows, days, key = 'basket') {
  const all = rows.filter(Boolean), ok = all.filter(r => r[key] !== null);
  const vsAll = ok.filter(r => r.allMean !== null), vsK = ok.filter(r => r.kospi !== null), vsMed = ok.filter(r => r.allMedian !== null);
  const pick = (xs, f) => xs.reduce((w, r) => (w === null || f(r) < f(w) || (f(r) === f(w) && r.k < w.k) ? r : w), null);
  const worst = pick(ok, r => r[key]), worstAll = pick(vsAll, r => r[key] - r.allMean), worstK = pick(vsK, r => r[key] - r.kospi);
  const share = (a, b) => (b ? a / b : null);
  const winAll = vsAll.filter(r => r[key] > r.allMean).length, winK = vsK.filter(r => r[key] > r.kospi).length, winMed = vsMed.filter(r => r[key] > r.allMedian).length;
  return {
    from: all.length ? days[all[0].k] : null, to: all.length ? days[all.at(-1).k] : null, days: all.length, counted: ok.length, unknown: all.length - ok.length,
    cash: ok.filter(r => r.n === 0).length,
    winAll, vsAll: vsAll.length, winAllShare: share(winAll, vsAll.length),
    winKospi: winK, vsKospi: vsK.length, winKospiShare: share(winK, vsK.length),
    winAllMedian: winMed, vsAllMedian: vsMed.length,
    diffAll: med(vsAll.map(r => r[key] - r.allMean)), diffKospi: med(vsK.map(r => r[key] - r.kospi)),
    median: med(ok.map(r => r[key])), allMean: med(vsAll.map(r => r.allMean)), kospi: med(vsK.map(r => r.kospi)),
    beat: med(ok.filter(r => r.beat !== null).map(r => r.beat)),
    worst: worst && {date: days[worst.k], k: worst.k, r: worst[key], allMean: worst.allMean, kospi: worst.kospi},
    worstVsAll: worstAll && {date: days[worstAll.k], k: worstAll.k, diff: worstAll[key] - worstAll.allMean, r: worstAll[key], allMean: worstAll.allMean},
    worstVsKospi: worstK && {date: days[worstK.k], k: worstK.k, diff: worstK[key] - worstK.kospi, r: worstK[key], kospi: worstK.kospi},
  };
}

/** 고른 날마다 결과(sels: Map k → selectOn 결과) → {m1, m3} 줄 · 셀 수 있는 창 · 요약 · 띄어 센 요약 */
export function evaluate(bl, sels, {from, to, kStart: k0 = undefined}) {
  const days = bl.days, ks = [...sels.keys()].sort((a, b) => a - b);
  const kStart = k0 !== undefined ? k0 : ks.find(k => evaluable(sels.get(k))) ?? null;
  const out = {kStart, start: kStart === null ? null : days[kStart], notEval: ks.filter(k => kStart === null || k < kStart).length, holds: {}};
  for (const [name, h] of Object.entries(HOLDS)) {
    const kEnd = Math.min(to, bl.n - 1 - h);
    const rows = ks.filter(k => k >= from && k <= kEnd).map(k => dayReturn(bl, normSel(sels.get(k)), k, h));
    const inWin = kStart === null ? [] : rows.filter(r => r && r.k >= kStart);
    const spaced = kStart === null ? [] : inWin.filter(r => (r.k - kStart) % h === 0);
    out.holds[name] = {hold: h, kEnd, rows, all: summarize(rows, days), main: summarize(inWin, days), rule: summarize(inWin, days, 'rule'), nonOverlap: summarize(spaced, days),
      picked: summarize(inWin.filter(r => r.n > 0), days)};
  }
  return out;
}

/** 화면 글(쉬운 말 · 숫자는 반올림) — ko = 「어떻게 골랐나」 맨 위 한 줄 · more = 접은 칸 · side = 참고(규칙이 다름 · 화면에 안 써도 됨) · 영어 틀은 i18n/add.mjs 로 등록 */
export function buildLines(ev, evSide, days, sideYears) {
  const pct = x => (x === null || x === undefined ? '?' : (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(Math.round(x * 1000) / 10).toFixed(1) + '%');
  const pp = x => (x === null || x === undefined ? '?' : (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(Math.round(x * 1000) / 10).toFixed(1) + '%p');
  const kd = d => { const [y, m, dd] = d.split('-').map(Number); return `${y}년 ${m}월 ${dd}일`; };
  const md = (d, ref) => { const [y, m, dd] = d.split('-').map(Number); return ref && ref.slice(0, 4) !== d.slice(0, 4) ? `${y}년 ${m}월 ${dd}일` : `${m}월 ${dd}일`; };
  const M = ev?.holds?.m1?.main ?? {counted: 0}, M3 = ev?.holds?.m3?.main ?? {counted: 0}, N1 = ev?.holds?.m1?.nonOverlap ?? {counted: 0};
  if (!M.counted) return {ko: '지난 성적 — 같은 규칙으로 셀 수 있는 날이 아직 없어요', more: [], side: null};
  const more = [];
  if (M3.counted) more.push(`석 달 뒤로 보면 모든 회사 평균보다 나은 날 ${M3.vsAll}날 중 ${M3.winAll}날 · 코스피보다 나은 날 ${M3.vsKospi}날 중 ${M3.winKospi}날 · 가장 나쁜 날 ${md(M3.worst.date, M.from)} ${pct(M3.worst.r)}`);
  more.push(`가운데 날로 보면 한 달 뒤 모든 회사 평균보다 ${pp(M.diffAll)} · 코스피보다 ${pp(M.diffKospi)}`);
  if (N1.counted) more.push(`겹치지 않게 한 달마다 띄어 세면 모든 회사 평균보다 나은 때 ${N1.vsAll}번 중 ${N1.winAll}번 · 코스피보다 나은 때 ${N1.vsKospi}번 중 ${N1.winKospi}번`);
  more.push(`고를 회사가 없어 현금으로 둔 날 ${M.cash}날 — 이날은 0%로 셈`);
  const Pk = ev?.holds?.m1?.picked;
  if (Pk?.counted) more.push(`고른 회사가 있던 날만 보면 한 달 뒤 모든 회사 평균보다 나은 날 ${Pk.vsAll}날 중 ${Pk.winAll}날 · 코스피보다 나은 날 ${Pk.vsKospi}날 중 ${Pk.winKospi}날`);
  more.push(`같은 규칙은 세 해 결산이 모두 나온 ${kd(ev.start)}부터 셀 수 있어요. 값 기록은 ${kd(days[0])}부터 있고 결산은 2023 ~ 2025년 세 해만 있어요.`);
  more.push('지난 날에는 분기 결산 대신 해마다 결산을 쓰고, 거래소 · 공시 목록 없이 셌어요. 그래서 오늘 고르는 셈과 조금 달라요.');
  more.push('상장이 폐지된 회사는 기록에 없어 모든 회사 값이 실제보다 좋게 나올 수 있어요.');
  const S = evSide?.holds?.m1?.main;
  return {
    ko: `지난 성적(나빠도 실음): ${kd(M.from)} ~ ${md(M.to, M.from)} 날마다 같은 규칙으로 고르면, 한 달 뒤 모든 회사 평균보다 나은 날 ${M.vsAll}날 중 ${M.winAll}날 · 코스피보다 나은 날 ${M.vsKospi}날 중 ${M.winKospi}날 · 가장 나쁜 날 ${md(M.worst.date, M.from)} ${pct(M.worst.r)}`,
    more,
    side: S?.counted ? `참고(규칙이 다름 — 손해 없는 해 ${sideYears}해): ${kd(S.from)} ~ ${md(S.to, S.from)} 한 달 뒤 모든 회사 평균보다 나은 날 ${S.vsAll}날 중 ${S.winAll}날 · 코스피보다 나은 날 ${S.vsKospi}날 중 ${S.winKospi}날` : null,
  };
}

/** 그날(k) 알 수 있던 것만 남긴 모음 — 그날 뒤 일봉 줄 자름 · 그날 못 쓰던 결산 칸(결산 달 M 의 넉 달째 1일 전 · 예상 칸)을 엉뚱한 값으로 */
export function pitBundle(B, date, {poison = true} = {}) {
  const cutDay = date.replaceAll('-', '');
  const usableAfter = (key, lag) => { const y = Number(String(key).slice(0, 4)), m = Number(String(key).slice(4, 6)); if (!(y > 0 && m >= 1 && m <= 12)) return '9999-12-31'; const mm = m + lag, yy = y + Math.floor((mm - 1) / 12), m2 = ((mm - 1) % 12) + 1; return `${yy}-${String(m2).padStart(2, '0')}-01`; };
  const usable = key => usableAfter(key, 4) <= date;
  let poisoned = 0, html = 0;
  const stocks = {};
  for (const [c, s] of Object.entries(B.stocks ?? {})) {
    let finance = s.finance;
    if (poison && finance?.kind === 'json' && finance.text) {
      try {
        const j = JSON.parse(finance.text), fi = j.financeInfo ?? {};
        const bad = new Set((fi.trTitleList ?? []).filter(t => t.isConsensus === 'Y' || !usable(t.key)).map(t => t.key));
        if (bad.size) { for (const r of fi.rowList ?? []) for (const k of bad) if (r.columns?.[k]) { r.columns[k] = {...r.columns[k], value: '-999,999'}; poisoned++; } finance = {...finance, text: JSON.stringify(j)}; }
      } catch { /* 못 읽는 원문은 그대로 */ }
    } else if (poison && finance?.kind === 'html') html++;
    // 받은 때(2026-10-14) 요약 칸 — 값 · 시총 · PER · PBR · 52주 · 예상 칸은 늘 바꿈 · EPS · BPS 는 기준 달 M 의 석 달째 1일 전 · 배당은 넉 달째 1일 전이면 바꿈
    let integration = s.integration, list = s.list;
    if (poison && integration?.text) {
      try {
        const j = JSON.parse(integration.text);
        for (const t of j.totalInfos ?? []) {
          const m = /^(\d{4})\.(\d{2})/.exec(String(t?.valueDesc ?? '')), lag = t?.code === 'eps' || t?.code === 'bps' ? 3 : t?.code === 'dividend' ? 4 : null;
          if (lag !== null && m && usableAfter(m[1] + m[2], lag) <= date) continue;
          if (t && 'value' in t) { t.value = '-999,999'; poisoned++; }
        }
        integration = {...integration, text: JSON.stringify(j)};
      } catch { /* 못 읽는 원문은 그대로 */ }
    }
    if (poison && list && Number(list.listValue) > 0) { list = {...list, listValue: 1}; poisoned++; }
    stocks[c] = {...s, list, integration, finance, fchart: s.fchart ? {...s.fchart, rows: (s.fchart.rows ?? []).filter(r => String(r[0]) <= cutDay)} : s.fchart};
  }
  return {bundle: {...B, stocks}, poisoned, html};
}

const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);

async function main() {
  const t0 = Date.now(), secs = {};
  const tick = (name, t) => { secs[name] = Math.round((Date.now() - t) / 100) / 10; };
  const bundlePath = arg('--bundle', process.env.GDR_BUNDLE || DEFAULT_BUNDLE), site = arg('--site', 'site/atlas/data');
  const OUT = path.resolve(ROOT, arg('--out', 'site/next/data/gdr-back.json')), CHECK = process.argv.includes('--check');
  const pickerPath = path.resolve(ROOT, arg('--picker', 'scripts/atlas11/next/gdr/pick2.mjs'));
  const PIT = Number(arg('--pit', 6)), SIDE = arg('--side', '1') === '0' ? null : Number(arg('--side', '1')), FROM = Number(arg('--from', 250));
  if (!fs.existsSync(pickerPath)) { console.log('고도리 지난 성적 — 고르는 셈(pick2.mjs) 없음 · 결과 파일은 그대로'); process.exit(0); }
  if (!fs.existsSync(path.resolve(ROOT, bundlePath))) { console.log('고도리 지난 성적 — 모음 없음 · 결과 파일은 그대로'); process.exit(0); }
  const P = await import(pathToFileURL(pickerPath).href);
  let t = Date.now();
  let B = readBundle(bundlePath); tick('readBundle', t);
  t = Date.now(); const data = await P.loadData({bundle: B, site, quarters: null, lists: null}); tick('loadData', t);
  t = Date.now(); const bl = loadBaseline(B); tick('loadBaseline', t);
  const days = bl.days;
  if (Array.isArray(data?.days) && (data.days.length !== days.length || data.days.some((d, i) => d !== days[i]))) throw new Error(`달력이 다름 — pick2 ${data.days.length}날 · baseline ${days.length}날`);
  const TO = bl.n - 1 - HOLDS.m1;
  const run = (opts, label) => {
    const t1 = Date.now(), sels = new Map(); let calls = 0, version = null;
    for (let k = FROM; k <= TO; k++) { const r = P.selectOn(data, k, opts); calls++; version ??= r?.version ?? null; sels.set(k, r); }
    tick(label, t1);
    return {sels, calls, version};
  };
  // ⑤ 셀 수 있는 창 첫 날 — 결산 해가 회사 주식 절반 넘게 모인 첫 날(본 줄 3해 · 참고 줄은 이익 · 매출이 늘었나에 두 해가 있어야 해 max(손해 없는 해, 2))
  const readyMain = fyReady(B, bl.codes, days, 3), readySide = SIDE ? fyReady(B, bl.codes, days, Math.max(SIDE, 2)) : null;
  const firstReady = r => { for (let k = FROM; k <= TO; k++) if (r.count[k] * 2 > r.of) return k; return null; };
  const kStartMain = firstReady(readyMain), kStartSide = readySide ? firstReady(readySide) : null;
  const mainRun = run({backtest: true}, 'select');
  const sideRun = SIDE ? run({backtest: true, lossYears: SIDE}, 'selectSide') : null;
  // ⑦ 그날 것만 — 표본 날(셀 수 있는 창에 고르게 · 참고 줄 창도)
  const pit = {days: [], compared: 0, diffs: 0, first: [], poisoned: 0, baseline: {compared: 0, diffs: 0}};
  if (PIT > 0) {
    t = Date.now();
    const spread = (a, b, n) => (a === null || b < a ? [] : Array.from({length: n}, (_, i) => Math.round(a + ((b - a) * i) / Math.max(1, n - 1))));
    const sample = [...new Set([...spread(kStartMain, TO, Math.ceil(PIT / 2)), ...(sideRun ? spread(kStartSide, TO, Math.floor(PIT / 2)) : [])])].sort((a, b) => a - b);
    for (const k of sample) {
      const pb = pitBundle(B, days[k]);
      const dk = await P.loadData({bundle: pb.bundle, site, quarters: null, lists: null});
      pit.poisoned += pb.poisoned;
      const checks = [['main', mainRun, {backtest: true}], ...(sideRun ? [['side', sideRun, {backtest: true, lossYears: SIDE}]] : [])];
      for (const [name, r, opts] of checks) {
        const a = P.selectOn(dk, k, opts), same = sameSel(a, r.sels.get(k));
        pit.compared++; if (!same) { pit.diffs++; if (pit.first.length < 3) pit.first.push({k, date: days[k], run: name, cut: normSel(a), full: normSel(r.sels.get(k))}); }
      }
      // 바탕 비교: 한 달 끝 날 뒤를 자른 모음 = 모두로 셈한 값
      const e = bl.endOf(k, HOLDS.m1);
      if (e > 0) {
        const cutB = pitBundle(B, days[e], {poison: false}).bundle, blk = loadBaseline(cutB, {sha: false});
        pit.baseline.compared++;
        if (JSON.stringify(blk.allCompanies(k, HOLDS.m1)) !== JSON.stringify(bl.allCompanies(k, HOLDS.m1)) || JSON.stringify(blk.kospi(k, HOLDS.m1)) !== JSON.stringify(bl.kospi(k, HOLDS.m1))) pit.baseline.diffs++;
      }
      pit.days.push(days[k]);
    }
    tick('pit', t);
  }
  B = null;
  t = Date.now();
  const ev = evaluate(bl, mainRun.sels, {from: FROM, to: TO, kStart: kStartMain});
  const evSide = sideRun ? evaluate(bl, sideRun.sels, {from: FROM, to: TO, kStart: kStartSide}) : null;
  tick('returns', t);
  const m1 = ev.holds.m1, m3 = ev.holds.m3;
  const s6 = s => s && JSON.parse(JSON.stringify(s, (k, v) => (typeof v === 'number' && !Number.isInteger(v) ? R6(v) : v)));
  const M = m1.main, M3 = m3.main;
  const line = buildLines(ev, evSide, days, SIDE);
  const rowsOut = rows => rows.filter(Boolean).map(r => [r.k, R6(r.basket), R6(r.rule), R6(r.allMean), R6(r.allMedian), R6(r.kospi), R6(r.beat), r.n, r.unknown, r.stale, r.jump]);
  const out = {
    schema: 'godori-back-1', version: mainRun.version, backtest: BACKTEST_VERSION, baseline: BASELINE_VERSION, made: new Date().toISOString(),
    bundle: bl.meta.bundle, bundleSha256: bl.meta.bundleSha256, calendar: bl.meta.calendar,
    window: {from: days[FROM], to: days[TO], k0: FROM, k1: TO, calls: mainRun.calls, start: ev.start, kStart: ev.kStart, notEval: ev.notEval,
      ready: {need: readyMain.need, of: readyMain.of, noFinance: readyMain.noFinance, atStart: ev.kStart === null ? null : readyMain.count[ev.kStart], dayBefore: ev.kStart === null || ev.kStart < 1 ? null : readyMain.count[ev.kStart - 1],
        rule: '창 첫 날 = 회사 주식 절반 넘게 실제 결산 세 해를 쓸 수 있게 된 첫 날(결산 달 M 의 넉 달째 1일) — 고른 결과를 보지 않고 자료만으로 정함'},
      m1: {from: M.from, to: M.to, days: M.days}, m3: {from: M3.from, to: M3.to, days: M3.days},
      why: `모음 일봉은 ${days[0]} ~ ${days.at(-1)}(${days.length}날) · 고르는 문이 1년(${FROM}날) 값을 보아 ${days[FROM]} 부터 고를 수 있고 한 달 뒤 값이 있어야 해 ${days[TO]} 까지 · 3해 손해 없음 문은 실제 결산 세 해가 회사 주식 절반 넘게 모인 날(${ev.start ?? '없음'})부터 셀 수 있어(모음의 결산은 거의 2023 ~ 2025해 셋 · 12월 결산의 2025해는 2026-04-01 부터 씀) 그 앞 ${ev.notEval}날은 「규칙을 못 셈」(현금)으로만 셈 — 3년이 안 되는 까닭`},
    rules: {
      pick: `날마다 pick2.mjs selectOn(data, k, {backtest: true}) 한 번(${mainRun.version}) · 목록 문(KIND · DART)은 지난 날 목록이 없어 건너뜀 · 최근 4분기 합 자리에 그날 쓸 수 있던 마지막 결산 해(pick2 status.quarters = annual)`,
      basket: '고도리 칸 = 고른 곳 같은 돈 평균 · 규칙 비중 = Σ 비중 × 오름(현금 0) · 고른 곳이 없으면 현금 0% · 값이 없으면 「?」',
      compare: '모든 회사 = 같은 날 거래된 회사 주식 모두 같은 돈 평균(바구니끼리) · 가운데값은 참고(winAllMedian) · 코스피 = 지수 종가 · 이긴 날 = 고도리 칸 오름이 더 큼',
      value: bl.meta.valueRule, universe: bl.meta.universeRule, jump: bl.meta.jumpRule,
    },
    survivorship: bl.meta.survivorship,
    kospi: {sources: bl.meta.kospi.sources.map(s => ({file: s.file, from: s.from, to: s.to, shared: s.shared, disagree: s.disagree, used: s.used, added: s.added})), covered: bl.meta.kospi.covered, missing: bl.meta.kospi.missing},
    pit: {days: pit.days, compared: pit.compared, diffs: pit.diffs, first: pit.first, poisonedCells: pit.poisoned, baseline: pit.baseline,
      rule: '표본 날마다 그날 뒤 일봉 줄을 자르고 그날 못 쓰던 결산 칸(결산 달 M 의 넉 달째 1일 전 · 예상 칸) · 받은 때(2026-10-14) 요약 칸(값 · 시총 · PER · PBR · 52주 · 목록 시총 · 그날 못 쓰던 EPS · BPS · 배당)을 -999,999(목록 시총은 1)로 바꾼 모음으로 다시 골라 고른 곳 · 비중 · 현금이 같은지 · 바탕 비교는 한 달 끝 날 뒤를 자른 모음과 맞댐'},
    line, holds: HOLDS,
    summary: {m1: s6(m1.main), m3: s6(m3.main)},
    rule: {m1: s6(m1.rule), m3: s6(m3.rule)},
    nonOverlap: {m1: s6(m1.nonOverlap), m3: s6(m3.nonOverlap)},
    picked: {m1: s6(m1.picked), m3: s6(m3.picked), note: '고른 회사가 있던 날만(현금 날 뺌) — 참고'},
    everyDay: {m1: s6(m1.all), m3: s6(m3.all), note: '규칙을 못 셈(현금) 날까지 모두 넣은 것 — 참고'},
    side: evSide ? {lossYears: SIDE, label: `참고 — 규칙이 다름(손해 없는 해 3 → ${SIDE}) · 같은 규칙의 성적이 아님`, version: sideRun.version, start: evSide.start, kStart: evSide.kStart,
      need: readySide.need, m1: s6(evSide.holds.m1.main), m3: s6(evSide.holds.m3.main), nonOverlap: {m1: s6(evSide.holds.m1.nonOverlap), m3: s6(evSide.holds.m3.nonOverlap)},
      picked: {m1: s6(evSide.holds.m1.picked), m3: s6(evSide.holds.m3.picked)}} : null,
    columns: ['k', 'basket', 'rule', 'allMean', 'allMedian', 'kospi', 'beat', 'n', 'unknown', 'stale', 'jump'],
    m1: rowsOut(m1.rows), m3: rowsOut(m3.rows),
    picks: [...mainRun.sels.keys()].sort((a, b) => a - b).map(k => { const s = normSel(mainRun.sels.get(k)); return [k, days[k], s.why, s.cash, s.picks.map(p => [p.code, p.w])]; }),
    secs: {...secs, total: Math.round((Date.now() - t0) / 100) / 10},
  };
  if (CHECK) { console.log(JSON.stringify({window: out.window, summary: out.summary, nonOverlap: out.nonOverlap, side: out.side, pit: out.pit, line, secs: out.secs}, null, 1)); return; }
  fs.writeFileSync(OUT, JSON.stringify(out) + '\n');
  console.log(`고도리 지난 성적 — ${path.relative(ROOT, OUT)} · 부름 ${mainRun.calls} · 셀 수 있는 창 ${ev.start} 부터 · 한 달 ${M.counted}날 · 그날 것만 ${pit.compared}번 다름 ${pit.diffs} · ${out.secs.total}초`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();

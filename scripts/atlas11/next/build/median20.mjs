#!/usr/bin/env node
// 모든 회사 가운데 값(한 달) — 사장님 2026-10-18(싱가포르) 「72개와 카톡 두 번 가입」 [5] 9
//   「한 달 뒤 값은 기록한 날 종가와 20거래일 뒤 종가를 날짜로 박아 셈하라. 같은 때 코스피와 모든 회사 가운데 값을 함께. 못 찾으면 「?」.」
//   읽음: <site>/atlas/data/days.json(날짜 줄) · <site>/atlas/data/co/*.json(회사 주식 모두 — close[j] = 날짜 줄 [j + k0] 의 종가)
//   씀:   <site>/next/data/median20.json — 사이트 자료는 바꾸지 않음
//   셈:   시작 날마다(날짜 줄의 i · 스무 번째 뒤 날 i + 20 이 있을 때만) 두 날 종가가 모두 있는(0보다 큰) 회사의 (끝 ÷ 시작 − 1) × 100 → 가운데 값(짝수면 가운데 둘의 평균) · 소수 둘째 자리 반올림 · n = 셈한 회사 수
//   꼴:   {schema: 'godori-median20-1', made, asOf, days: 20, src, rows: [[시작 날, 끝 날, 가운데 값 %, n], …]}  ← 매매일지(site/next/p-why.js laterVals)가 시작 날 · 끝 날을 둘 다 맞대 봄
//   쓰는 법: node scripts/atlas11/next/build/median20.mjs [--site site]
//            import {build} from './median20.mjs'; await build({siteDir}) → 한 줄 요약(일꾼 S2c 의 build_data.mjs 가 올리기 때 부름)
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const LATER = 20; // 한 달 = 장 스무 번
const r2 = x => Math.round(x * 100) / 100;
/** 가운데 값(숫자 배열 · 비면 null) */
export function median(xs) {
  if (!xs.length) return null;
  const v = Float64Array.from(xs).sort(), m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}
/** 날짜 줄 D 와 회사 선들 → 줄 [[시작, 끝, 가운데 값 %, n]] */
export function rowsOf(D, series) {
  const N = D.length, buckets = Array.from({length: Math.max(0, N - LATER)}, () => []);
  for (const {close, k0} of series) {
    for (let i = 0; i + LATER < N; i++) {
      const a = close[i - k0], b = close[i + LATER - k0];
      if (a > 0 && b > 0) buckets[i].push((b / a - 1) * 100);
    }
  }
  const rows = [];
  buckets.forEach((xs, i) => { const m = median(xs); if (m != null) rows.push([D[i], D[i + LATER], r2(m), xs.length]); });
  return rows;
}
export async function build({siteDir}) {
  const dataDir = path.join(siteDir, 'atlas/data'), out = path.join(siteDir, 'next/data/median20.json');
  const days = JSON.parse(await fs.readFile(path.join(dataDir, 'days.json'), 'utf8'));
  const D = days?.dates;
  if (!Array.isArray(D) || D.length <= LATER || D.some((d, i) => typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d) || (i && d <= D[i - 1]))) throw Error('median20: days.json 날짜 줄이 비었거나 차례가 틀림');
  const files = (await fs.readdir(path.join(dataDir, 'co'))).filter(f => /^[0-9][0-9A-Z]{5}\.json$/.test(f)).sort();
  const series = [];
  let bad = 0;
  for (const f of files) {
    let j = null; try { j = JSON.parse(await fs.readFile(path.join(dataDir, 'co', f), 'utf8')); } catch { bad++; continue; }
    const close = Array.isArray(j?.close) ? j.close : null, k0 = Number.isInteger(j?.k0) ? j.k0 : 0;
    if (!close || k0 < 0 || k0 + close.length > D.length) { bad++; continue; } // 날짜 줄에 맞지 않는 선은 셈 밖
    series.push({close, k0});
  }
  if (!series.length) throw Error('median20: 회사 선이 하나도 없음');
  const rows = rowsOf(D, series);
  const doc = {schema: 'godori-median20-1', made: new Date().toISOString(), asOf: days.asOf ?? D[D.length - 1], days: LATER,
    src: {days: days.asOf ?? null, co: series.length, skipped: bad}, rows};
  await fs.mkdir(path.dirname(out), {recursive: true});
  const body = JSON.stringify(doc);
  await fs.writeFile(out, body + '\n');
  const ns = rows.map(r => r[3]);
  return `median20: 시작 날 ${rows.length}개(${rows[0]?.[0] ?? '?'} ~ ${rows.at(-1)?.[0] ?? '?'}) · 회사 ${series.length}곳(건너뜀 ${bad}) · 날마다 n ${Math.min(...ns)} ~ ${Math.max(...ns)} · ${(body.length / 1024).toFixed(1)}KB · 자료 날 ${doc.asOf}`;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2), i = argv.indexOf('--site');
  const siteDir = path.resolve(i >= 0 && argv[i + 1] ? argv[i + 1] : path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../../site'));
  build({siteDir}).then(s => console.log(s), e => { console.error(e.message); process.exit(1); });
}

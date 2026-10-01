/**
 * 시험용 가짜 지난 자료 (atlas4h-history-1 꼴 그대로 · collect.mjs collectHistory 가 쓰는 칸과 같음) — 진짜 값이 아님 [예시]
 *   writeHistoryFixture(dir, {sessions, seed, until, usHolidays, fetchedAt})
 *     kospi.json: 한국 거래일(sessions) 날마다 · 출처 둘(naver·krx) · status ok
 *     sox.json  : 미국 평일 중 휴장일(usHolidays) 뺀 날 · 출처 하나(naver) · status 한 출처
 */
import fs from 'node:fs';
import path from 'node:path';

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 정규분포 비슷한 난수 (12개 합) */
function gauss(rand) {
  let s = 0;
  for (let i = 0; i < 12; i++) s += rand();
  return s - 6;
}

export const US_HOLIDAYS_2026 = ['2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25', '2026-06-19', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25'];

export function usSessions(from, to, holidays = US_HOLIDAYS_2026) {
  const out = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += 864e5) {
    const d = new Date(t);
    const wd = d.getUTCDay();
    const s = d.toISOString().slice(0, 10);
    if (wd > 0 && wd < 6 && !holidays.includes(s)) out.push(s);
  }
  return out;
}

function doc(id, series, fetchedAt, sources) {
  return {
    schema: 'atlas4h-history-1', id, fetchedAt, from: series[0].date, to: series.at(-1).date,
    observedAtRule: '시험용 가짜 자료 [예시]', compare: {rule: 'relative', tolerance: 0.0005},
    sources, counts: {ok: series.filter(r => r.status === 'ok').length, '한 출처': series.filter(r => r.status === '한 출처').length, '확인 중': 0, '옛값': 0, '없음': 0},
    series,
  };
}

export function makeKospi(sessions, {seed = 1, until = '2026-10-01', start = 2600, fetchedAt = '2026-10-01T22:00:00+09:00'} = {}) {
  const rand = rng(seed);
  let v = start;
  const series = [];
  for (const d of sessions.filter(s => s <= until)) {
    v = Math.round(v * (1 + 0.011 * gauss(rand)) * 100) / 100;
    series.push({date: d, value: v, sources: {naver: v, krx: v}, status: 'ok'});
  }
  return doc('kospi', series, fetchedAt, [
    {name: 'naver', url: 'https://m.stock.naver.com/api/index/KOSPI/price?pageSize=10&page=1', fetchedAt, rawSha256: 'a'.repeat(64), rows: series.length},
    {name: 'krx', url: 'https://data-dbg.krx.co.kr/svc/apis/idx/kospi_dd_trd?basDd={YYYYMMDD}', fetchedAt, rawSha256: 'b'.repeat(64), rows: series.length},
  ]);
}

export function makeSox(days, {seed = 2, start = 5000, fetchedAt = '2026-10-01T22:00:00+09:00'} = {}) {
  const rand = rng(seed);
  let v = start;
  const series = [];
  for (const d of days) {
    v = Math.round(v * (1 + 0.02 * gauss(rand)) * 100) / 100;
    series.push({date: d, value: v, sources: {naver: v}, status: '한 출처'});
  }
  return doc('sox', series, fetchedAt, [{name: 'naver', url: 'https://api.stock.naver.com/index/.SOX/price?page=1&pageSize=10', fetchedAt, rawSha256: 'c'.repeat(64), rows: series.length}]);
}

/** 폴더에 kospi.json·sox.json 을 쓴다 (only 로 하나만 쓸 수 있음) */
export function writeHistoryFixture(dir, {sessions, until = '2026-10-01', soxUntil = '2026-09-30', only = null, seed = 1} = {}) {
  fs.mkdirSync(dir, {recursive: true});
  const out = {};
  if (!only || only === 'kospi') {
    out.kospi = makeKospi(sessions, {seed, until});
    fs.writeFileSync(path.join(dir, 'kospi.json'), JSON.stringify(out.kospi, null, 1) + '\n');
  }
  if (!only || only === 'sox') {
    out.sox = makeSox(usSessions('2023-06-01', soxUntil), {seed: seed + 1});
    fs.writeFileSync(path.join(dir, 'sox.json'), JSON.stringify(out.sox, null, 1) + '\n');
  }
  return out;
}

#!/usr/bin/env node
/**
 * 수르 42칸 「며칠째 · 첫 발견」 — 올릴 때마다(scripts/atlas11/package.mjs · 수르 21곳을 다시 센 바로 뒤)
 *   주문 0123 덧붙임(사장님 2026-11-09 01:44 「그리고 몇일째 그 항목에 있는지도 표기가 되어야 하고 첫포착은 첫 발견이라고 기록 되어야 해 퐁 42곳 모두에 말이야」)
 *   기록 = reports/atlas11/su21/days.json — 날(그날 판 board.json 의 asOf)마다 여섯 목록의 회사 번호
 *     · 지난 날(2026-10-02 ~ 11-06)은 같은 고르는 규칙으로 다시 센 것(how replay · su21_replay.mjs) · 그 뒤는 올릴 때마다 그날 판으로 센 것을 한 번 적음(how kept · 먼저 적은 것을 바꾸지 않음)
 *   며칠째 = 오늘(그날 판)부터 거꾸로 장이 열린 날을 하나씩 — 그 목록에 계속 들어 있던 날 수(오늘 포함)
 *     · 장이 열린 날 = 사이트 자료 날짜(atlas/data/days.json) + 기록한 날 · 판이 빠진 날(예: 11월 2일)은 앞뒤 판에 모두 들어 있으면 이어진 것으로 셈
 *   첫 발견 = 그렇게 이어진 날 가운데 맨 앞날 · 기록 첫날까지 이어지면 since = true(「기록 첫날부터」)
 *   칸마다 days · found · since 를 su21.json · su21-next.json 목록에 더함 — 첫 페이지 42칸 · 「왜?」 쪽이 읽음
 * 쓰는 법: node scripts/atlas11/next/su21_days.mjs --su <su/data 폴더> --cal <atlas/data/days.json> [--days reports/atlas11/su21/days.json] [--keep]
 *   --keep = 그날 목록을 기록에 적음(올리기 작업만 · package.mjs 가 깃허브 올리기 작업일 때 붙임)
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const KEYS = Object.freeze(['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext']);
export const DAYS_FILE = 'reports/atlas11/su21/days.json';
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** 장이 열린 날 — 자료 날짜 + 기록한 날 + 오늘(차례대로 · 겹침 없음) */
export function calendarOf(tradeDates, rec, today) {
  return [...new Set([...(tradeDates ?? []), ...Object.keys(rec?.days ?? {}), today].filter(d => typeof d === 'string' && DAY.test(d) && d <= today))].sort();
}
/** 그날 그 목록에 들었나 — 기록이 없는 날은 null */
const inOn = (rec, d, k, code) => { const x = rec?.days?.[d]; return x ? (x.lists?.[k] ?? []).includes(code) : null; };
/** 오늘 그 목록에 든 회사의 이어진 날 — {days, found, since} */
export function runOf(rec, cal, today, k, code) {
  const back = cal.filter(d => d < today).reverse(), first = Object.keys(rec?.days ?? {}).sort()[0] ?? today;
  let n = 1, found = today, since = false;
  for (let i = 0; i < back.length; i++) {
    const d = back[i], v = inOn(rec, d, k, code);
    if (v === true) { n++; found = d; continue; }
    if (v === false) break;
    if (d < first) { since = true; break; } // 기록 첫날보다 앞 — 더 셀 수 없음
    const next = back.slice(i + 1).find(x => rec.days[x]); // 판이 빠진 날 — 바로 앞 기록한 날에도 들어 있으면 이어진 것
    if (next && inOn(rec, next, k, code)) { n++; found = d; continue; }
    break;
  }
  if (found === first) since = true;
  return {days: n, found, since};
}
/** 그날 목록을 기록에 적음 — 이미 적은 날은 그대로(먼저 적은 것을 바꾸지 않음) · 적었으면 참 */
export function keepDay(rec, su, suNext, made) {
  const d = su?.asOf?.board; if (!DAY.test(d ?? '') || rec.days[d]) return false;
  const rule = su?.strict?.rule ?? null; // 고르는 규칙(주문 0854) — 기록의 규칙과 다르면 적지 않음(지난 판 다시 세기가 먼저 새 규칙으로 바꿈)
  if ((rec.rule ?? null) !== rule && Object.keys(rec.days).length) return false;
  rec.rule = rule;
  const L = k => ((k.endsWith('Next') ? suNext?.lists?.[k] ?? su?.lists?.[k] : su?.lists?.[k]) ?? []).map(c => c.code);
  rec.days[d] = {how: 'kept', data: su.asOf?.data ?? null, at: made, lists: Object.fromEntries(KEYS.map(k => [k, L(k)]))};
  rec.days = Object.fromEntries(Object.keys(rec.days).sort().map(x => [x, rec.days[x]]));
  return true;
}
/** 칸마다 며칠째 · 첫 발견을 더함(su21.json · su21-next.json 목록 그대로 고침) */
export function annotate(rec, cal, su, suNext) {
  const today = su?.asOf?.board, first = Object.keys(rec?.days ?? {}).sort()[0] ?? today;
  for (const f of [su, suNext]) for (const k of KEYS) for (const c of f?.lists?.[k] ?? []) Object.assign(c, runOf(rec, cal, today, k, c.code));
  su.days = {from: first, to: today, how: '기록 첫날(' + first + ')부터 장이 열린 날로 셈 · 지난 날은 같은 고르는 규칙으로 다시 센 판 · 판이 빠진 날은 앞뒤 판에 모두 들어 있으면 이어진 것으로 셈', file: DAYS_FILE};
  return su;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const arg = (k, d = null) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
  const SU = path.resolve(arg('--su')), CAL = arg('--cal'), DAYS = path.resolve(arg('--days', path.join(ROOT, DAYS_FILE)));
  const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
  const su = J(path.join(SU, 'su21.json')), nf = path.join(SU, 'su21-next.json'), suNext = fs.existsSync(nf) ? J(nf) : null;
  let rec; try { rec = J(DAYS); } catch { rec = {schema: 'su21-days-1', days: {}}; }
  if (!rec.days || typeof rec.days !== 'object') rec.days = {};
  let trade = []; try { trade = J(CAL).dates ?? []; } catch { /* 자료 날짜가 없으면 기록한 날만 */ }
  if (process.argv.includes('--keep') && keepDay(rec, su, suNext, new Date().toISOString())) {
    fs.mkdirSync(path.dirname(DAYS), {recursive: true});
    const tmp = DAYS + '.tmp' + process.pid; fs.writeFileSync(tmp, JSON.stringify(rec, null, 1) + '\n'); fs.renameSync(tmp, DAYS);
    console.log('기록 — ' + su.asOf.board + ' 여섯 목록을 적음');
  }
  const cal = calendarOf(trade, rec, su.asOf.board);
  annotate(rec, cal, su, suNext);
  const w = (f, o) => { const tmp = f + '.tmp' + process.pid; fs.writeFileSync(tmp, JSON.stringify(o)); fs.renameSync(tmp, f); };
  w(path.join(SU, 'su21.json'), su); if (suNext) w(nf, suNext);
  const all = KEYS.flatMap(k => ((k.endsWith('Next') ? suNext?.lists?.[k] : su.lists?.[k]) ?? []).map(c => c.name + ' ' + c.days + '일째'));
  console.log('며칠째 · 첫 발견 — ' + all.length + '칸 · ' + all.slice(0, 6).join(' · ') + ' …');
}

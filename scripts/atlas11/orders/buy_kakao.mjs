#!/usr/bin/env node
// 살 차례 카톡(주문 1128-2342 · 사장님 2026-11-28(서울) 23:42 「뭘 매수할 예정인지 내 카톡으로 메세지 보내는 시스템 구축해」)
//   장부(reports/atlas11/su21/settle.json s36 — 장이 끝난 날마다 꾀마다 그날 고른 회사를 한 번 적음 · 올리기 작업이 적음)에서
//   그날 꾀 다섯 이상이 함께 고른 회사(주문 1128-2046 · su21_settle.mjs BUY5_FROM · BUY5_NEED · pick5 — 사고팔 탭 살 차례와 같은 셈)를 골라
//   카톡 「나에게 보내기」 글 묶음(한 통 200자 안)을 JSON 한 줄로 냄 — 보내기는 예약 작업의 카톡 도구가 함 · 이 파일은 글만 만듦(kakao_digest.mjs 와 같은 꼴)
//   상태: buy(살 회사 있음) · none(꾀 다섯 이상이 고른 회사 없음 — 그렇다고 한 통) · holiday(장이 쉬는 날 — 0통) · wait(오늘 장부가 아직 안 옴 — 0통 · 예약 작업이 기다렸다 다시 부름)
//   쓰는 법: node scripts/atlas11/orders/buy_kakao.mjs [--day YYYY-MM-DD(기본 오늘 · 한국 날)] [--ledger 파일] [--cal 파일] [--ops 파일] [--sample]
//   글은 쉬운 말 · 수익률 없음 · 앞날을 맞히지 않고 사고팔기를 권하지 않는다는 줄 · 장부는 가짜 돈
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BUY5_FROM, BUY5_NEED, pick5, S36} from '../next/su21_settle.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const MAX = 200, LINK = 'aaa7377.com/su/#/d';
const DAY = /^\d{4}-\d{2}-\d{2}$/, WD = ['일', '월', '화', '수', '목', '금', '토'];
const NUMW = {3: '셋', 4: '넷', 5: '다섯', 6: '여섯', 7: '일곱', 8: '여덟', 9: '아홉'};
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

/** 한국 날 YYYY-MM-DD(한국은 서머타임 없음) */
export const kstDay = (ms = Date.now()) => new Date(ms + 9 * 3600e3).toISOString().slice(0, 10);
/** 「11/30 월」 */
export const mdw = d => { const [y, m, dd] = d.split('-').map(Number); return `${m}/${dd} ${WD[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()]}`; };

/** 그날이 장이 여는 날인가 — true · false · null(모름)
 *  ① 장 달력(public/data/rolling-calendar.json)이 그날까지 덮으면 그 sessions ② 오늘 매일 작업 기록(reports/atlas11/operations/latest.json)의 1_calendar session ③ 토 · 일은 쉼 */
export function isSession(day, {cal = null, ops = null} = {}) {
  const wd = new Date(day + 'T00:00:00Z').getUTCDay();
  if (wd === 0 || wd === 6) return false;
  if (cal && Array.isArray(cal.sessions) && DAY.test(cal.coverageEnd ?? '') && day <= cal.coverageEnd && day >= (cal.coverageStart ?? '')) return cal.sessions.includes(day);
  const s = (ops?.dayKST === day && Array.isArray(ops?.steps)) ? ops.steps.find(x => x?.step === '1_calendar') : null;
  if (s && typeof s.session === 'boolean' && s.day === day) return s.session;
  return null;
}

/** 그날 꾀 다섯 이상이 고른 회사 — [{code, name, n(고른 꾀 수)}] · 고른 꾀가 많은 회사부터(같으면 번호 차례 — 사고팔 탭 buy5Of 와 같은 차례) */
export function buyList(B, day, need = BUY5_NEED) {
  const x = B?.s36?.[day];
  if (!x || typeof x !== 'object') return null;
  const ok = pick5(x, need), cnt = new Map();
  for (const k of S36) for (const c of new Set(Array.isArray(x[k]) ? x[k] : [])) if (ok.has(c)) cnt.set(c, (cnt.get(c) ?? 0) + 1);
  const rows = [...cnt].map(([code, n]) => ({code, name: Array.isArray(B.co?.[code]) && typeof B.co[code][0] === 'string' && B.co[code][0].trim() ? B.co[code][0].trim() : code, n}))
    .sort((a, b) => b.n - a.n || (a.code < b.code ? -1 : 1));
  return {rows, kn: S36.filter(k => Array.isArray(x[k]) && x[k].length).length, lots: rows.reduce((a, r) => a + r.n, 0)};
}

/** 줄들을 한 통 200자 안으로 묶음 — 둘째 통부터 「📋 이어서」 */
export function pack(lines, max = MAX) {
  const out = []; let cur = '';
  for (const l of lines) {
    if (cur && (cur + '\n' + l).length > max) { out.push(cur.replace(/\n+$/, '')); cur = l === '' ? '📋 이어서' : '📋 이어서\n' + l; continue; }
    cur = cur ? cur + '\n' + l : l;
  }
  if (cur) out.push(cur.replace(/\n+$/, ''));
  return out;
}

/** 카톡 글 묶음 — {ok, day, state, n, lots, kn, messages} */
export function buildKakao({B, day, cal = null, ops = null, sample = false, need = BUY5_NEED, from = BUY5_FROM, today = kstDay()}) {
  const head = `📋 손자병법 살 차례${sample ? ' [보기]' : ''} · ${mdw(day)}`, tail = ['가짜 돈 장부예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.', '자세히 · ' + LINK];
  const ses = isSession(day, {cal, ops}), L = buyList(B, day, need), when = day === today ? '오늘' : '이날';
  if (!L) {
    if (ses === false) return {ok: true, day, state: 'holiday', n: 0, lots: 0, kn: 0, messages: []};
    return {ok: true, day, state: 'wait', n: 0, lots: 0, kn: 0, session: ses, messages: [], why: '그날 장부(s36)가 아직 없음'};
  }
  const lines = [head];
  if (day < from) lines.push(`이날 장부는 꾀가 고른 회사를 모두 샀어요. ${mdw(from).split(' ')[0]}부터는 아래처럼 꾀 ${NUMW[need] ?? need} 이상이 고른 회사만 사요.`);
  if (!L.rows.length) {
    lines.push(`${when}은 꾀 ${NUMW[need] ?? need} 이상이 함께 고른 회사가 없어요. 그래서 사지 않아요.`);
    if (L.kn < S36.length) lines.push(`꾀 ${L.kn}가지 자료로 셌어요.`);
    return {ok: true, day, state: 'none', n: 0, lots: 0, kn: L.kn, messages: pack([...lines, '', ...tail])};
  }
  lines.push(`${when} 종가로 꾀 ${NUMW[need] ?? need} 이상이 함께 고른 회사 ${L.rows.length}곳을 사요.`, '');
  L.rows.forEach((r, i) => lines.push(`${i + 1}. ${r.name} · 꾀 ${r.n}`));
  lines.push('', `고른 꾀마다 10주씩, 모두 ${L.lots}번 사요.`);
  if (L.kn < S36.length) lines.push(`꾀 ${L.kn}가지 자료로 셌어요.`);
  return {ok: true, day, state: 'buy', n: L.rows.length, lots: L.lots, kn: L.kn, messages: pack([...lines, ...tail])};
}

function main() {
  const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
  const day = arg('--day', kstDay());
  if (!DAY.test(day)) { console.log(JSON.stringify({ok: false, why: '날 꼴이 아님 ' + day})); process.exit(2); }
  const B = readJson(arg('--ledger', path.join(ROOT, 'reports/atlas11/su21/settle.json')));
  if (!B || typeof B.s36 !== 'object') { console.log(JSON.stringify({ok: false, day, why: '장부를 못 읽음'})); process.exit(1); }
  const cal = readJson(arg('--cal', path.join(ROOT, 'public/data/rolling-calendar.json'))), ops = readJson(arg('--ops', path.join(ROOT, 'reports/atlas11/operations/latest.json')));
  console.log(JSON.stringify(buildKakao({B, day, cal, ops, sample: a.includes('--sample')})));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

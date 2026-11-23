#!/usr/bin/env node
// 큐피트 정산 장부(주문 1112-1728 · 사장님 2026-11-12 17:28 「정산 페이지를 하나 만들어 테이블 하나 더 만들어 그럼 탭이 여섯 개가 되겠지 그래가지고 말이야
//   거기에 일 이 삼 등 매일 사 그담에 불 장인 것도 사고 모든 여덟 개를 종류별로 업종별로 다 사는거별로 분류 별별로」 · 17:30 「어」 — docs/design/settle-2026-11-12/order-1728.txt)
//   여덟 묶음을 고른 날 마지막 값으로 회사마다 10주씩 산 셈(가짜 돈 · 진짜 돈이 오가지 않음) · 산 뒤에는 팔지 않고 들고 있다고 침 · 같은 회사가 여러 묶음 · 여러 날에 들면 그때마다 따로 산 셈
//   묶음 차례: 1 · 2 · 3등(top3) · 불장 · 꽃이 될 · 돈이 몰리는 · 조용한데 힘이 모이는(quiet) · 불장이 될 듯 · 꽃이 될 듯 · 돈이 몰릴 듯
//   목록 — top3 = <su>/su21-book.json(1 · 2 · 3등 달력과 같은 날 · 같은 값) · 여섯 = reports/atlas11/su21/days.json(지난 날 replay = 지금 고르는 법으로 다시 센 기록 · 그 뒤 kept = 그날 적은 기록)
//          · quiet = 이 장부(그날 su21.json 넷째 창 일곱 · 처음 적은 날부터 · 올리기 작업만 씀)
//   값 — 회사마다 날마다 그날 마지막 값: 달력 장부 값(su21-book.json px) → 저장된 판(reports/atlas11/su21/boards/<날>.json.gz close) → 오늘 판(board.json close · 21 값은 su21.json cd 날이 판과 같을 때만)
//        · 한 번 적은 값은 고치지 않음(장부 px) · 지금 = 그 회사 값 줄의 오늘 판 날까지 가장 늦은 값 · 값이 없는 산 셈은 세지 않고 수만 남김(miss)
//   주문 1112-2042(사장님 2026-11-12 20:42 「자 정산을 오늘 부터 한다 그동안에 기록은 다 지운다」 · 11-13 08:55 「뭐해」 — docs/design/settle-2026-11-12/order-2042.txt)
//     첫날 START = 11월 12일 판 · 그 전 날 산 셈 · 값 · 조용한 힘 · 이름은 장부에서 지움(다시 센 지난 날도) · 조용한 힘은 su21 판 날 = 오늘 판 날일 때만 적음(묵은 su21 로 지난 날을 적지 않음)
//     · 달력(1 · 2 · 3등 · 조용한 힘)은 그대로(그 장부는 이 파일이 쓰지 않음)
//   주문 1113-2033(특징 열하나 · t11)은 주문 1113-2224 로 뺌 — 장부의 t11 기록은 지움(cut.t11)
//   주문 1113-2224(사장님 2026-11-13 22:24 「11 가지로 하지 말고 36가지 유형으로 … 손자병법을 적용해서 … 정산하고 연결해봐 36 가지가 다 7가지 정산까지 다 나누게」 · 22:26 「그래」
//     · 22:27 「정산표에는 수익율이 높은 순으로」 — docs/design/s36-2026-11-13/order-2224.txt)
//     손자병법 서른여섯 꾀 묶음(<su>/su21-s36.json · su21_s36.py · 일곱 곳씩)을 그날 판 날 = 셈한 자료 날일 때 장부(s36)에 꾀마다 한 번 적고 10주씩 산 셈 · 묶음 이름 g01 ~ g36
//     여덟 묶음과 따로 셈(화면은 표 둘 · 맨 위 「지금까지」는 여덟 그대로 · 서른여섯 표는 수익률 높은 차례 — 화면이 셈)
//   주문 1114-0802(사장님 2026-11-14 08:02 「… 그중에서 36개 정도 겹치는 그 종목을 별도로 또 … 또 폴더 또 만들어 그래도 똑같이 만들어」 · 08:06 「맞아」 — docs/design/s36-2026-11-13/order-0802.txt)
//     겹친 곳(<su>/su21-s36.json ovl — 첫 화면 마흔세 묶음 가운데 세 묶음 이상에 든 회사 · 날마다 수가 다름)을 꾀와 같은 때(그날 판 날 = 셈한 자료 날) 장부(ovl)에 하루 한 번 적고 10주씩 산 셈
//     · 묶음 이름 ovl(KINDS 맨 뒤 — 앞 묶음 차례는 그대로) · 며칠째도 꾀와 같은 셈 · 화면은 정산 쪽 표 하나 더(여덟 · 서른여섯과 따로 셈)
//   쓰는 곳: reports/atlas11/su21/settle.json(장부 — 올리기 작업 site · daily · evening 만 --keep) · <su>/su21-settle.json(화면)
//   쓰는 법: node scripts/atlas11/next/su21_settle.mjs --su <dist/su/data> --board <board.json> --days <reports/atlas11/su21/days.json> --book <reports/atlas11/su21/settle.json>
//            [--boards <reports/atlas11/su21/boards>] [--keep] [--out <파일>]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto'; // 날마다 기록 지문(주문 1119-0829)
import {fileURLToPath} from 'node:url';
import {calendarOf, runOf} from './su21_days.mjs'; // 며칠째 셈(주문 1114-0151 — 42칸과 같은 셈)

export const SCHEMA = 'su21-settle-1', BOOK_SCHEMA = 'su21-settle-book-1', QTY = 10;
/** 판 전체 하루 몫을 적을 때 셀 회사가 이만큼은 있어야 함(주문 1123-2358) */
export const MK_MIN = 100;
/** 정산 첫날(주문 1112-2042 「정산을 오늘 부터 한다」 — 받은 날 11월 12일 판) */
export const START = '2026-11-12';
/** 손자병법 서른여섯 꾀(주문 1113-2224 · su21_s36.py KINDS 차례 = 삼십육계 차례 1 ~ 36) */
export const S36 = Object.freeze(Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0')));
/** 묶음 — 여덟(앞 · 차례 그대로) 뒤에 서른여섯 꾀(g01 ~ g36) · 맨 뒤에 겹친 곳(ovl · 주문 1114-0802)을 붙임 */
export const OVL = 'ovl';
export const KINDS = Object.freeze(['top3', 'hot', 'bloom', 'money', 'quiet', 'hotNext', 'bloomNext', 'moneyNext', ...S36, OVL]);
const SIX = ['hot', 'bloom', 'money', 'hotNext', 'bloomNext', 'moneyNext'];
const DAY = /^\d{4}-\d{2}-\d{2}$/, CODE = /^[0-9A-Z]{6}$/;
const fin = v => typeof v === 'number' && Number.isFinite(v) && v > 0;
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const readGz = f => { try { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8')); } catch { return null; } };

export const emptySettle = () => ({schema: BOOK_SCHEMA, qty: QTY, note: '정산 장부 — 조용한 힘 일곱(그날 판) · 서른여섯 꾀 일곱씩(그날 판) · 겹친 곳(그날 판) · 회사마다 날마다 마지막 값 · 한 번 적은 날 · 값은 고치지 않음', quiet: {}, s36: {}, ovl: {}, px: {}, co: {}});
/** 장부 꼴 맞대기 */
export function okSettle(B) {
  return !!B && B.schema === BOOK_SCHEMA && B.qty === QTY && B.quiet && typeof B.quiet === 'object' && B.px && typeof B.px === 'object' && B.co && typeof B.co === 'object'
    && Object.entries(B.quiet).every(([d, cs]) => DAY.test(d) && Array.isArray(cs) && cs.every(c => CODE.test(c)))
    && Object.entries(B.px).every(([c, m]) => CODE.test(c) && m && typeof m === 'object' && Object.entries(m).every(([d, v]) => DAY.test(d) && fin(v)))
    && (B.t11 == null || typeof B.t11 === 'object') // 주문 1113-2033 의 옛 기록(읽으면 지움)
    && (B.s36 == null || (typeof B.s36 === 'object' && Object.entries(B.s36).every(([d, x]) => DAY.test(d) && x && typeof x === 'object'
      && Object.entries(x).every(([k, cs]) => S36.includes(k) && Array.isArray(cs) && cs.every(c => CODE.test(c))))))
    && (B.ovl == null || (typeof B.ovl === 'object' && Object.entries(B.ovl).every(([d, cs]) => DAY.test(d) && Array.isArray(cs) && cs.every(c => CODE.test(c))))) // 겹친 곳(주문 1114-0802)
    && (B.mk == null || (typeof B.mk === 'object' && Object.entries(B.mk).every(([d, f]) => DAY.test(d) && fin(f)))); // 판 전체 하루 몫(주문 1123-2358)
}
const indOf = c => c?.group?.industry ?? c?.group?.label ?? c?.ind ?? null;

/** 날마다 묶음 목록 — {날: {묶음: [번호…]}} · 여섯은 days.json(그날 판 날이 없고 su21 이 그 판이면 그날 su21 목록) · top3 = 달력 장부 · quiet = 장부 */
export function listsOf({days, sbook, su, suNext, quiet, s36 = {}, ovl = {}, start = START}) {
  const out = {}, put = (d, k, cs) => { if (!DAY.test(d ?? '') || d < start || !Array.isArray(cs) || !cs.length) return; ((out[d] ??= {})[k] = cs.filter(c => CODE.test(c))); };
  for (const [d, x] of Object.entries(days?.days ?? {})) for (const k of SIX) put(d, k, x?.lists?.[k]);
  const sd = su?.asOf?.board;
  if (DAY.test(sd ?? '') && !days?.days?.[sd]) for (const k of SIX) put(sd, k, ((k.endsWith('Next') ? suNext?.lists?.[k] ?? su?.lists?.[k] : su?.lists?.[k]) ?? []).map(c => c.code));
  for (const x of sbook?.days ?? []) put(x.board, 'top3', [...(x.picks ?? [])].sort((a, b) => a.place - b.place).map(p => p.code));
  for (const [d, cs] of Object.entries(quiet ?? {})) put(d, 'quiet', cs);
  for (const [d, x] of Object.entries(s36 ?? {})) for (const k of S36) put(d, k, x?.[k]); // 서른여섯 꾀(주문 1113-2224)
  for (const [d, cs] of Object.entries(ovl ?? {})) put(d, OVL, cs); // 겹친 곳(주문 1114-0802)
  return Object.fromEntries(Object.keys(out).sort().map(d => [d, out[d]]));
}

/** 장부 한 걸음 — 조용한 힘 그날 일곱 · 이름 · 업종 · 값 적기 · {book, added, cut}(들어온 장부는 바꾸지 않음)
 *  su = su21.json · board = 오늘 판(board.json) · stored = {날: 저장된 판} · sbook = su21-book.json · days = days.json · start = 정산 첫날 */
export function stepSettle(book0, {su, suNext, board, stored = {}, sbook, days, s36 = null, start = START, cal = []}) { // cal = 장이 열린 날(atlas/data/days.json dates · 판 전체 하루 몫의 21 장날 — 주문 1123-2358)
  const B = JSON.parse(JSON.stringify(okSettle(book0) ? book0 : emptySettle()));
  B.s36 ??= {}; B.ovl ??= {};
  let added = null, added36 = [], addedO = null;
  // ⓪ 첫날 전 기록은 지움(주문 1112-2042) — 조용한 힘 · 값(이름은 ② 뒤에 쓰는 회사만 남김)
  const cut = {quiet: Object.keys(B.quiet).filter(d => d < start).length, px: Object.values(B.px).reduce((a, m) => a + Object.keys(m).filter(d => d < start).length, 0)};
  if (B.t11) { cut.t11 = Object.keys(B.t11).length; delete B.t11; } // 주문 1113-2224 「11 가지로 하지 말고」 — 특징 열하나 기록은 지움
  B.quiet = Object.fromEntries(Object.entries(B.quiet).filter(([d]) => d >= start));
  B.s36 = Object.fromEntries(Object.entries(B.s36).filter(([d]) => d >= start));
  B.ovl = Object.fromEntries(Object.entries(B.ovl).filter(([d]) => d >= start));
  for (const code of Object.keys(B.px)) { B.px[code] = Object.fromEntries(Object.entries(B.px[code]).filter(([d]) => d >= start)); if (!Object.keys(B.px[code]).length) delete B.px[code]; }
  // ① 조용한 힘 일곱 — 그날 판(su21.json asOf.board)으로 한 번 적음(먼저 적은 날은 그대로) · su21 판 날 = 오늘 판 날일 때만(묵은 su21 로 지난 날을 적지 않음 — 11-13 08:59 묵은 판이 11월 6일을 적은 일)
  const sd = su?.asOf?.board, q = (su?.lists?.quiet ?? []).map(c => c?.code).filter(c => CODE.test(c ?? ''));
  if (DAY.test(sd ?? '') && sd >= start && sd === board?.asOf && q.length && !B.quiet[sd]) { B.quiet[sd] = q; added = sd; B.quiet = Object.fromEntries(Object.keys(B.quiet).sort().map(d => [d, B.quiet[d]])); }
  // ①' 서른여섯 꾀(주문 1113-2224) — su21-s36.json 판 날 = 셈한 자료 날 = 오늘 판 날일 때만 · 꾀마다 그날 처음 빈 목록이 아닐 때 한 번(거래량 다섯은 받은 때만 차므로 꾀마다 따로)
  const td = s36?.asOf?.board;
  if (s36?.rule && DAY.test(td ?? '') && td >= start && td === board?.asOf && s36?.asOf?.data === td) {
    for (const k of S36) {
      const cs = (s36.lists?.[k] ?? []).map(x => x?.code).filter(c => CODE.test(c ?? ''));
      if (cs.length && !B.s36[td]?.[k]) { (B.s36[td] ??= {})[k] = cs; added36.push(k); }
    }
    B.s36 = Object.fromEntries(Object.keys(B.s36).sort().map(d => [d, B.s36[d]]));
    // 겹친 곳(주문 1114-0802) — 같은 날 조건 · 그날 처음 빈 목록이 아닐 때 한 번(먼저 적은 날은 그대로)
    const oc = (s36.ovl?.rule && Array.isArray(s36.ovl.list) ? s36.ovl.list : []).map(x => x?.code).filter(c => CODE.test(c ?? ''));
    if (oc.length && !B.ovl[td]) { B.ovl[td] = oc; addedO = td; B.ovl = Object.fromEntries(Object.keys(B.ovl).sort().map(d => [d, B.ovl[d]])); }
  }
  const L = listsOf({days, sbook, su, suNext, quiet: B.quiet, s36: B.s36, ovl: B.ovl, start});
  const need = new Set(Object.values(L).flatMap(x => Object.values(x).flat()));
  for (const code of Object.keys(B.co)) if (!need.has(code)) { delete B.co[code]; cut.co = (cut.co ?? 0) + 1; }
  // ② 이름 · 업종 — 오늘 판 → 저장된 판(늦은 날 먼저) → 그대로
  const co = new Map((board?.companies ?? []).map(c => [c.code, c]));
  for (const code of need) {
    const c = co.get(code) ?? Object.keys(stored).sort().reverse().map(d => (stored[d]?.companies ?? []).find(x => x?.code === code)).find(Boolean);
    if (c?.name) B.co[code] = [String(c.name), indOf(c) ?? B.co[code]?.[1] ?? null];
  }
  // ③ 값 — 한 번 적은 값은 그대로(??=)
  const mark = (code, d, v) => { if (!need.has(code) || !DAY.test(d ?? '') || d < start || !fin(v)) return; (B.px[code] ??= {})[d] ??= v; };
  for (const [code, ser] of Object.entries(sbook?.px ?? {})) for (const [d, v] of (Array.isArray(ser) ? ser : Object.entries(ser ?? {}))) mark(code, d, v);
  for (const [d, b] of Object.entries(stored)) for (const c of b?.companies ?? []) if (c?.date === d) mark(c.code, d, c.close);
  const cd = [su?.lists ?? {}, suNext?.lists ?? {}].flatMap(x => Object.values(x).flat()).find(x => Array.isArray(x?.cd) && x.cd.length === 21 && x.cd[20] === board?.asOf)?.cd ?? null;
  for (const c of board?.companies ?? []) {
    if (c?.date === board?.asOf) mark(c.code, c.date, c.close);
    if (cd && Array.isArray(c.c) && c.c.length === 21 && c.cFrom === cd[0] && c.date === cd[20]) cd.forEach((d, j) => mark(c.code, d, c.c[j]));
  }
  for (const code of Object.keys(B.px)) B.px[code] = Object.fromEntries(Object.entries(B.px[code]).sort(([a], [b]) => a.localeCompare(b)));
  B.px = Object.fromEntries(Object.keys(B.px).sort().map(c => [c, B.px[c]]));
  B.co = Object.fromEntries(Object.keys(B.co).sort().map(c => [c, B.co[c]]));
  // ④ 판 전체 하루 몫(주문 1123-2358 · 사장님 2026-11-23(서울) 23:58 「너 맘대로 해」 — 장부 잣대 1번 「시장과 나란히」 · docs/design/sonja-ledger11-2026-11-23/brief.md)
  //    그날 판 우량주를 같은 돈으로 고르게 나눠 든 셈의 하루 몫 = 회사마다 「그 전 장날 값 → 그날 값」의 평균 · 첫날 뒤 날마다 한 번 적음(먼저 적은 날은 그대로 · 고치지 않음)
  //    오늘 판 21날 값(c · 날은 su21 cd)으로 셈 · 하루에 30% 넘게 움직인 값(쪼개기 · 합치기)은 뺌 · 회사 100곳 넘을 때만
  B.mk = Object.fromEntries(Object.entries(B.mk ?? {}).filter(([d, f]) => DAY.test(d) && d > start && fin(f)));
  //    21 장날 = su21 cd → 없으면 장이 열린 날(cal)에서 판 날까지 21날(지금 su21.json 목록에는 cd 가 없음 — 2026-11-24 올림 run 45207876537 장부 mk 가 빈 것을 보고 더함)
  const cdM = cd ?? (() => { const T = [...new Set((Array.isArray(cal) ? cal : []).filter(d => DAY.test(d ?? '')))].sort(), i = T.lastIndexOf(board?.asOf ?? ''); return i >= 20 ? T.slice(i - 20, i + 1) : null; })();
  if (cdM) {
    const cd = cdM;
    for (let j = 1; j < 21; j++) {
      const d = cd[j];
      if (!DAY.test(d ?? '') || d <= start || B.mk[d] != null) continue;
      const xs = [];
      for (const c of board?.companies ?? []) {
        if (!Array.isArray(c?.c) || c.c.length !== 21 || c.cFrom !== cd[0] || c.date !== cd[20] || !fin(c.c[j]) || !fin(c.c[j - 1])) continue;
        const r = c.c[j] / c.c[j - 1];
        if (r > 0.7 && r < 1.3) xs.push(r);
      }
      if (xs.length >= MK_MIN) B.mk[d] = Math.round(xs.reduce((s, x) => s + x, 0) / xs.length * 1e6) / 1e6;
    }
  }
  B.mk = Object.fromEntries(Object.keys(B.mk).sort().map(d => [d, B.mk[d]]));
  return {book: B, added, added36, addedO, lists: L, cut};
}

/** 화면 자료 — 산 셈(날 · 묶음 · 번호 · 산 값) · 지금(회사마다 오늘 판 날까지 가장 늦은 값 · 그 날) · 묶음 첫날 · 다시 센 날 끝 · 못 센 수 */
export function siteSettle(B, L, asOf, days, start = START) {
  const buys = [], miss = Object.fromEntries(KINDS.map(k => [k, 0])), from = {}, now = {};
  for (const [d, x] of Object.entries(L)) {
    if (asOf && d > asOf) continue;
    KINDS.forEach((k, i) => {
      for (const code of x[k] ?? []) {
        const v = B.px?.[code]?.[d];
        if (!fin(v)) { miss[k]++; continue; }
        buys.push([d, i, code, v]); from[k] ??= d;
      }
    });
  }
  for (const code of new Set(buys.map(b => b[2]))) {
    const last = Object.entries(B.px[code]).filter(([d]) => !asOf || d <= asOf).sort(([a], [b]) => a.localeCompare(b)).pop();
    now[code] = [last[1], last[0]];
  }
  const replay = Object.entries(days?.days ?? {}).filter(([d, x]) => x?.how === 'replay' && d >= start).map(([d]) => d).sort();
  return {schema: SCHEMA, qty: B.qty, asOf: asOf ?? null, start, kinds: [...KINDS], from, replayTo: replay[replay.length - 1] ?? null,
    co: Object.fromEntries([...new Set(buys.map(b => b[2]))].sort().map(c => [c, B.co[c] ?? [c, null]])), buys, now, miss, mk: mkLevels(B, asOf, start)};
}
/** 판 전체가 걸어온 길(주문 1123-2358 · 장부 잣대 1번) — 장날마다 첫날 = 1 에서 하루 몫을 곱해 온 값 {날: 값} · 장날은 장부 값 날 ∪ 하루 몫 날
 *  하루 몫이 빠진 장날을 만나면 거기서 멈춤(그 뒤 날은 견주지 않음 · 화면은 그 줄을 시장과 견주지 않음) */
export function mkLevels(B, asOf, start = START) {
  const mk = B?.mk ?? {}, days = [...new Set([...Object.values(B?.px ?? {}).flatMap(m => Object.keys(m ?? {})), ...Object.keys(mk)])].filter(d => DAY.test(d) && d >= start && (!asOf || d <= asOf)).sort();
  const out = {};
  let lv = 1;
  for (const [i, d] of days.entries()) {
    if (i) { if (!fin(mk[d])) break; lv *= mk[d]; }
    out[d] = Math.round(lv * 1e6) / 1e6;
  }
  return out;
}
/** 쌓인 장부 전체(주문 1123-2358 · 장부 잣대 3번 「가장 깊이 빠진 때」) — 날마다 서른여섯 꾀를 모두 더한 「100원이 ○원 × 10000」(그날까지 값 · trackSite 와 같은 셈 · 산 셈 없으면 null) */
export const trackTotal = (lines, days) => { const A = trackAll(lines, days), sum = xs => xs.reduce((s, x) => s + (x ?? 0), 0);
  return {days: A.map(d => d.day), w: A.map(d => { const c = sum(d.c), v = sum(d.v); return c > 0 ? Math.round(v / c * 1e6) : null; })}; };

/** 날마다 쌓인 값(주문 1119-0829 · 사장님 2026-11-19(마카오) 08:29 「하루치는 알수 있으나 누적값을 알수가 없다 … 꺽기 그래프는 기존이 되어야 하고 이 지금 만드는
 *    추적 시스템은 정말 소중한 데이타가 된다 … 탈무드에 지혜를 학습해」 · 08:43 「응」 — docs/design/settle-track-2026-11-19/order-0829.txt)
 *  서른여섯 꾀를 첫 산 날부터 장부 값이 있는 날마다(판 날까지) 그날까지 산 셈 · 그날까지 가장 늦은 값으로 셈 — 화면 settle36(su-sonja-kkoe.js)과 같은 셈
 *  → [{day, c(산 돈 · 원), v(그날 센 돈 · 원), r(늘어난 몫 · 백만에 하나 · 하루치 · 산 셈 없음은 null), o(차례 — 꾀 차례 번호 0 ~ 35)}…] · 산 셈 없는 꾀는 c · v 도 null */
export function trackDays(B, S) {
  const kk = (S?.kinds ?? []).map((k, i) => [k, i]).filter(([k]) => /^g(0[1-9]|[12]\d|3[0-6])$/.test(k)), at = new Map(kk.map(([, i], j) => [i, j]));
  const q = Number.isFinite(S?.qty) ? S.qty : QTY, buys = (S?.buys ?? []).filter(b => Array.isArray(b) && at.has(b[1]) && fin(b[3]) && b[3] > 0);
  if (kk.length !== 36 || !buys.length) return [];
  const asOf = S?.asOf ?? null, first = buys.reduce((m, b) => (b[0] < m ? b[0] : m), buys[0][0]);
  const days = [...new Set(Object.values(B?.px ?? {}).flatMap(p => Object.keys(p ?? {})))].filter(d => DAY.test(d) && d >= first && (!asOf || d <= asOf)).sort();
  const last = (code, d) => { let v = null, vd = null; for (const [x, y] of Object.entries(B?.px?.[code] ?? {})) if (x <= d && fin(y) && (vd === null || x > vd)) { vd = x; v = y; } return [v, vd]; };
  return days.map(d => {
    const g = kk.map(() => ({cost: 0, val: 0, n: 0, one: true}));
    for (const [bd, ki, code, buy] of buys) {
      if (bd > d) continue;
      const [v, vd] = last(code, d), x = g[at.get(ki)], now = v ?? buy, nd = v == null ? bd : vd; // 화면 settleRows 와 같음 — 그날까지 값이 없으면 산 값 · 하루치
      x.cost += buy * q; x.val += now * q; x.n++; x.one = x.one && !(nd > bd);
    }
    const r = g.map(x => (x.n && x.cost > 0 && !x.one ? Math.round((x.val - x.cost) / x.cost * 1e6) : null));
    const o = g.map((x, j) => j).sort((a, b) => (r[a] === null) - (r[b] === null) || (r[b] ?? 0) - (r[a] ?? 0) || a - b);
    return {day: d, c: g.map(x => (x.n ? Math.round(x.cost) : null)), v: g.map(x => (x.n ? Math.round(x.val) : null)), r, o};
  });
}
/** 날마다 바뀐 차례(주문 1119-0243 · 02:43 「그 순위가 매일 매일 어떻게 변화하는지」 · 02:46 「응」 — docs/design/settle-rank-2026-11-19/order-0243.txt)
 *  쌓인 값(trackDays) 가운데 차례를 셀 꾀가 하나라도 있는 날(모두 하루치인 날은 뺌) → {days, order} */
export const rankOf = T => { const R = T.filter(d => d.r.some(x => x !== null)); return {days: R.map(d => d.day), order: R.map(d => d.o)}; };
export const rank36 = (B, S) => rankOf(trackDays(B, S));

/** 날마다 기록(주문 1119-0829) — reports/atlas11/su21/settle-track.jsonl · 한 줄 = 하루 · 올리기 작업만 덧붙임
 *  탈무드에서 배운 셋: 랍비 아키바의 물방울(아보트 데랍비 나탄 6 — 하루 한 방울보다 쌓인 값) · 「정직하게 거래했나 · 때를 정해 배웠나」(샤바트 31a — 같은 때에 적고 고치지 않음)
 *  · 「복은 달고 재고 센 것에 있지 않다」(바바 메찌아 42a — 하루 오르내림은 작게)
 *  지킬 것: 한 번 적은 줄은 고치지 않음(마지막 적은 날 뒤의 날만 덧붙임) · 줄마다 앞 줄 지문 p 와 제 지문 h(sha256) — 한 줄이라도 고치면 지문이 끊겨 드러남
 *  · 지문이 끊긴 기록에는 덧붙이지 않음(화면에 broken) · 지금 다시 센 값이 적은 줄과 다르면 고치지 않고 diff 로 알림 */
export const TRACK = 'settle-track-1', ZERO = '0'.repeat(64);
export const trackHash = L => crypto.createHash('sha256').update(JSON.stringify([L.day, L.at, L.rule, L.c, L.v, L.r, L.o, L.p])).digest('hex');
export function sealTrack(lines, days, at) {
  const out = [...lines], added = [];
  for (const d of days) {
    const prev = out.length ? out[out.length - 1] : null;
    if (prev && !(d.day > prev.day)) continue;
    const L = {day: d.day, at, rule: TRACK, c: d.c, v: d.v, r: d.r, o: d.o, p: prev ? prev.h : ZERO};
    L.h = trackHash(L); out.push(L); added.push(d.day);
  }
  return {lines: out, added};
}
/** 지문 확인 → 끊긴 줄 번호(0부터) — 제 지문 · 앞 줄 지문 · 날 차례 */
export const checkTrack = lines => lines.flatMap((L, i) => (L?.h === trackHash(L) && L.p === (i ? lines[i - 1].h : ZERO) && (!i || L.day > lines[i - 1].day) ? [] : [i]));
/** 적은 줄과 지금 다시 센 값이 다른 날(고치지 않고 알리기만) */
export const trackDiff = (lines, days) => { const m = new Map(days.map(d => [d.day, d])), J = JSON.stringify; return lines.filter(L => m.has(L.day) && (J(m.get(L.day).c) !== J(L.c) || J(m.get(L.day).v) !== J(L.v) || J(m.get(L.day).r) !== J(L.r))).map(L => L.day); };
/** 기록 읽기 — 없으면 [] · 못 읽으면 null */
export const readTrack = f => { try { return fs.readFileSync(f, 'utf8').split('\n').filter(x => x.trim()).map(x => JSON.parse(x)); } catch (e) { return e?.code === 'ENOENT' ? [] : null; } };
/** 적은 줄 + 그 뒤 날은 지금 센 값(아직 안 적은 날 · 올리기 작업이 아닐 때) */
export const trackAll = (lines, days) => { const end = lines.length ? lines[lines.length - 1].day : ''; return [...lines, ...days.filter(d => d.day > end)]; };
/** 화면 자료 tr — days · w(100원이 ○원 × 10000 · 정수 · 산 셈 없으면 null — 쪽이 센 오늘 값과 소수 첫째 자리까지 같게(주문 1119-1317)) · sealed(마지막 적은 날) */
export const trackSite = (lines, days) => { const A = trackAll(lines, days);
  return {days: A.map(d => d.day), w: A.map(d => d.c.map((c, j) => (c && d.v[j] != null ? Math.round(d.v[j] / c * 1e6) : null))), sealed: lines.length ? lines[lines.length - 1].day : null}; };
const kstMin = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 16) + '+09:00';

/** 첫 쪽 기록(주문 1119-1151 · 사장님 2026-11-19(마카오) 11:51 「어제의 주식상황은 이랬고 오늘의 주식상황은 이렇게 변화가 있다 … 기록을 해주어야 하고 … 어제는 이런 병법으로 대처를 했고
 *    오늘은 이런 병법」 — docs/design/sonja-yday-2026-11-19/order-1151.txt) — reports/atlas11/su21/sun-track.jsonl · 한 줄 = 장이 끝난 하루(장중 값 · 굳지 않은 날은 적지 않음)
 *  그날 시장 모습(땅) · 그날 첫 쪽에 실은 꾀(첫 쪽 nowPick 과 같은 법 — 꾀 셋 첫째 · 없으면 덜 잃은 차례 첫째) · 앞 줄 지문 p · 제 지문 h · 한 번 적은 줄은 고치지 않음 */
export const SUN_TRACK = 'sun-track-1', LANDS5 = Object.freeze(['fall', 'shake', 'rise', 'narrow', 'calm']);
export const sunHash = L => crypto.createHash('sha256').update(JSON.stringify([L.day, L.at, L.rule, L.land, L.k, L.win, L.p])).digest('hex');
export const sunPick = x => { const w = (x?.win3?.ks ?? []).filter(k => S36.includes(k)), r = (x?.rank ?? []).map(q => q?.k).filter(k => S36.includes(k)); return w.length ? {k: w[0], win: true} : r.length ? {k: r[0], win: false} : null; };
export function sealSun(lines, x, at) {
  const last = lines.length ? lines[lines.length - 1] : null, pk = sunPick(x);
  if (!x || x.prov !== false || !DAY.test(x.day ?? '') || !LANDS5.includes(x.land) || !pk || (last && !(x.day > last.day))) return {lines, added: null};
  const L = {day: x.day, at, rule: SUN_TRACK, land: x.land, k: pk.k, win: pk.win, p: last ? last.h : ZERO}; L.h = sunHash(L);
  return {lines: [...lines, L], added: x.day};
}
export const checkSun = lines => lines.flatMap((L, i) => (L?.h === sunHash(L) && L.p === (i ? lines[i - 1].h : ZERO) && (!i || L.day > lines[i - 1].day) ? [] : [i]));

/** 며칠째(주문 1114-0151 · 사장님 2026-11-14 01:51 「지금 이렇게 301 게 이게 며칠째 이렇게 됐는지도 좀 기록 하게 해 봐」)
 *  장부의 서른여섯 꾀 · 조용한 힘 기록(그날 판마다 한 번 적은 목록)으로 오늘 목록 회사마다 {days, found, since} — 42칸(su21_days.mjs)과 같은 셈
 *  · 며칠째 = 오늘부터 거꾸로 장이 열린 날마다 그 묶음에 들어 있던 날 수(오늘 포함) · 판이 빠진 날은 앞뒤 기록에 모두 들어 있으면 이어진 것 · 첫 발견 = 이어진 날 맨 앞 · since = 기록 첫날까지 이어짐
 *  trade = 장이 열린 날(atlas/data/days.json dates) · today = 오늘 판 날 */
export function runsOf(B, trade, today) {
  const rec36 = {days: Object.fromEntries(Object.entries(B?.s36 ?? {}).map(([d, x]) => [d, {lists: x}]))};
  const recQ = {days: Object.fromEntries(Object.entries(B?.quiet ?? {}).map(([d, cs]) => [d, {lists: {quiet: cs}}]))};
  const recO = {days: Object.fromEntries(Object.entries(B?.ovl ?? {}).map(([d, cs]) => [d, {lists: {[OVL]: cs}}]))}; // 겹친 곳(주문 1114-0802)
  const s36 = {}, quiet = {}, ovl = {}, ok = DAY.test(today ?? '');
  const cal36 = ok ? calendarOf(trade, rec36, today) : [], calQ = ok ? calendarOf(trade, recQ, today) : [], calO = ok ? calendarOf(trade, recO, today) : [];
  const run36 = (k, c) => (ok && CODE.test(c ?? '') ? runOf(rec36, cal36, today, k, c) : null), runQ = c => (ok && CODE.test(c ?? '') ? runOf(recQ, calQ, today, 'quiet', c) : null);
  const runO = c => (ok && CODE.test(c ?? '') ? runOf(recO, calO, today, OVL, c) : null);
  for (const k of S36) for (const c of B?.s36?.[today]?.[k] ?? []) (s36[k] ??= {})[c] = run36(k, c);
  for (const c of B?.quiet?.[today] ?? []) quiet[c] = runQ(c);
  for (const c of B?.ovl?.[today] ?? []) ovl[c] = runO(c);
  return {s36, quiet, ovl, run36, runQ, runO, from36: Object.keys(B?.s36 ?? {}).sort()[0] ?? null, fromQ: Object.keys(B?.quiet ?? {}).sort()[0] ?? null, fromO: Object.keys(B?.ovl ?? {}).sort()[0] ?? null};
}
/** 화면 자료에 며칠째를 붙임 — su21-s36.json 꾀마다 회사 · su21.json 조용한 힘(그 파일 판 날 = 오늘 판 날일 때만) · 붙인 수
 *  오늘 든 것 = 화면 목록(그날 다시 센 목록 — 장부 그날 목록은 처음 적은 것이라 다를 수 있음) · 지난 날 = 장부 기록 */
export function markRuns(R, g, su, today) {
  let n36 = 0, nq = 0, no = 0;
  if (g && g.asOf?.board === today) {
    for (const k of S36) for (const c of g.lists?.[k] ?? []) { const r = R.run36(k, c?.code); if (r) { Object.assign(c, r); n36++; } }
    g.daysFrom = R.from36;
    if (g.ovl && Array.isArray(g.ovl.list) && R.runO) { for (const c of g.ovl.list) { const r = R.runO(c?.code); if (r) { Object.assign(c, r); no++; } } g.ovl.daysFrom = R.fromO; } // 겹친 곳(주문 1114-0802)
  }
  if (su && su.asOf?.board === today) { for (const c of su.lists?.quiet ?? []) { const r = R.runQ(c?.code); if (r) { Object.assign(c, r); nq++; } } su.quietDays = {from: R.fromQ}; }
  return {n36, nq, no};
}

/** 저장된 판 — {날: 판}(파일 이름 날 = 판 asOf 일 때만) */
export function storedBoards(dir) {
  const out = {};
  let fs0 = []; try { fs0 = fs.readdirSync(dir).filter(f => /^\d{4}-\d{2}-\d{2}\.json\.gz$/.test(f)); } catch { return out; }
  for (const f of fs0.sort()) { const d = f.slice(0, 10), b = readGz(path.join(dir, f)); if (b?.asOf === d && Array.isArray(b.companies)) out[d] = b; }
  return out;
}

function main() {
  const a = process.argv.slice(2), arg = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  const su = arg('--su'), boardF = arg('--board'), daysF = arg('--days'), bookF = arg('--book'), keep = a.includes('--keep'), calF = arg('--cal'); // --cal = 장이 열린 날(atlas/data/days.json · 며칠째 — 주문 1114-0151)
  const boardsDir = arg('--boards') ?? path.join(ROOT, 'reports/atlas11/su21/boards'), out = arg('--out') ?? (su ? path.join(su, 'su21-settle.json') : null);
  if (!su || !boardF || !daysF || !bookF) { console.error('--su · --board · --days · --book 이 필요함'); process.exit(2); }
  const S = readJson(path.join(su, 'su21.json')), N = readJson(path.join(su, 'su21-next.json')), board = readJson(boardF), days = readJson(daysF), sbook = readJson(path.join(su, 'su21-book.json'));
  const s36 = readJson(path.join(su, 'su21-s36.json')); // 서른여섯 꾀(주문 1113-2224 · su21.py 가 씀 · 없으면 그날은 적지 않음)
  if (!board || !Array.isArray(board.companies)) { console.error('판을 못 읽음'); process.exit(1); }
  const stored = storedBoards(boardsDir), cal = calF ? readJson(calF)?.dates ?? [] : []; // 장이 열린 날(판 전체 하루 몫 21 장날 · 며칠째)
  const {book, added, added36, addedO, lists, cut} = stepSettle(readJson(bookF), {su: S, suNext: N, board, stored, sbook, days, s36, cal});
  const site = siteSettle(book, lists, board.asOf, days);
  // 날마다 기록(주문 1119-0829) — 올리기 작업(--keep)만 덧붙임 · 지문이 끊겼으면 덧붙이지 않음 · 화면은 적은 줄 + 아직 안 적은 날(지금 센 값)
  const trackF = path.join(path.dirname(bookF), 'settle-track.jsonl'), T0 = readTrack(trackF), TD = trackDays(book, site), broken = T0 === null ? -1 : checkTrack(T0).length;
  let T = T0 ?? [], sealed = [];
  if (keep && T0 !== null && broken === 0) { const s = sealTrack(T0, TD, kstMin()); T = s.lines; sealed = s.added; if (sealed.length) fs.appendFileSync(trackF, T.slice(T0.length).map(L => JSON.stringify(L)).join('\n') + '\n'); }
  const A = trackAll(T, TD), diff = trackDiff(T, TD);
  site.rk = rankOf(A); // 날마다 바뀐 차례(주문 1119-0243) — 적은 줄 차례 그대로
  site.tr = {...trackSite(T, TD), broken, diff}; // 쌓인 값 꺾은선(주문 1119-0829)
  site.tt = trackTotal(T, TD); // 쌓인 장부 전체(주문 1123-2358 · 장부 잣대 3번 「가장 깊이 빠진 때」)
  if (out) fs.writeFileSync(out, JSON.stringify(site) + '\n');
  if (keep) { const tmp = bookF + '.tmp' + process.pid; fs.writeFileSync(tmp, JSON.stringify(book, null, 1) + '\n'); fs.renameSync(tmp, bookF); }
  // 며칠째(주문 1114-0151) — 서른여섯 꾀(su21-s36.json) · 조용한 힘(su21.json)에 회사마다 days · found · since
  const trade = calF ? readJson(calF)?.dates ?? [] : [], R = runsOf(book, trade, board.asOf), w = (f, o) => { const tmp = f + '.tmp' + process.pid; fs.writeFileSync(tmp, JSON.stringify(o)); fs.renameSync(tmp, f); };
  const M = markRuns(R, s36, S, board.asOf);
  // 꾀 칸 쌓인 값(주문 1119-1317 · 13:17 「꾀 칸을 보면 눌러야 꺽기 그래프가 나와 바로 보이게 해」) — 첫 쪽 · 꾀 모음 꾀 칸이 누르지 않아도 그리게 꾀 칸 자료에 tr(정산 쪽과 같은 값)
  const trK = {days: site.tr.days, w: site.tr.w};
  if (s36 && typeof s36 === 'object' && JSON.stringify(s36.tr ?? null) !== JSON.stringify(trK)) { s36.tr = trK; M.n36 = M.n36 || 1; }
  if (M.n36 || M.no) w(path.join(su, 'su21-s36.json'), s36);
  // 첫 쪽 기록(주문 1119-1151) — 올리기 작업만 · 장이 끝난 날만 · 지문이 끊기면 덧붙이지 않음 · 첫 쪽은 su21.json sunLog(마지막 일곱 줄)로 어제 꾀를 씀
  const sunF = path.join(path.dirname(bookF), 'sun-track.jsonl'), U0 = readTrack(sunF), sunBroken = U0 === null ? -1 : checkSun(U0).length;
  let U = U0 ?? [], sunAdded = null;
  if (keep && U0 !== null && sunBroken === 0) { const s = sealSun(U0, S?.sun, kstMin()); U = s.lines; sunAdded = s.added; if (sunAdded) fs.appendFileSync(sunF, JSON.stringify(U[U.length - 1]) + '\n'); }
  const sunLog = {broken: sunBroken, rows: U.slice(-7).map(L => ({day: L.day, land: L.land, k: L.k, win: L.win}))};
  if (S && typeof S === 'object' && JSON.stringify(S.sunLog ?? null) !== JSON.stringify(sunLog)) { S.sunLog = sunLog; M.nq = M.nq || 1; }
  if (M.nq) w(path.join(su, 'su21.json'), S);
  const nk = Object.fromEntries(KINDS.map(k => [k, site.buys.filter(b => KINDS[b[1]] === k).length]));
  console.log(`정산 장부 — 날 ${Object.keys(lists).length} · 산 셈 ${site.buys.length}번(${KINDS.map(k => k + ' ' + nk[k]).join(' · ')}) · 값 없음 ${Object.values(site.miss).reduce((x, y) => x + y, 0)} · 저장된 판 ${Object.keys(stored).length} · 판 ${board.asOf}`
    + ' · 첫날 ' + START + (cut.quiet || cut.px || cut.co ? ` · 첫날 전 기록 지움(조용한 힘 ${cut.quiet}날 · 값 ${cut.px}개 · 이름 ${cut.co ?? 0}곳)` : '') + (cut.t11 ? ` · 특징 열하나 기록 지움(${cut.t11}날)` : '')
    + (added ? ' · 조용한 힘 새로 적음 ' + added : '') + (added36.length ? ' · 서른여섯 꾀 새로 적음 ' + board.asOf + '(' + added36.length + '꾀)' : ' · 서른여섯 꾀 새로 적은 꾀 0(판 ' + (s36?.asOf?.board ?? '없음') + ' · 자료 ' + (s36?.asOf?.data ?? '없음') + ')')
    + (addedO ? ' · 겹친 곳 새로 적음 ' + addedO + '(' + book.ovl[addedO].length + '곳)' : '')
    + ' · 첫 쪽 기록 ' + U.length + '줄' + (sunAdded ? '(새로 ' + sunAdded + ')' : '') + (sunBroken ? ' · 첫 쪽 기록 지문 끊김 ' + sunBroken : '') + ' · 날마다 기록 ' + T.length + '줄' + (sealed.length ? '(새로 ' + sealed.join(' · ') + ')' : '') + (broken ? ' · 지문 끊김 ' + broken : '') + (diff.length ? ' · 다시 센 값 다름 ' + diff.join(' · ') : '') + (keep ? ' · 장부 씀' : ' · 장부 안 씀(올리기 작업 아님)') + ' · 며칠째 꾀 ' + M.n36 + '곳 · 조용한 힘 ' + M.nq + '곳 · 겹친 곳 ' + M.no + '곳');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

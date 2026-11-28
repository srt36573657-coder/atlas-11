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
/** 꾀 다섯 이상만 사기(주문 1128-2046 · 사장님 2026-11-28(서울) 20:46 「앞으로 매수 조건을 꾀가 5가지 이상만 있는 조건에 종목을 매수 한다」 · 21:31 「맞아」 — docs/design/buy5-2026-11-28/order-2046.txt)
 *  11월 30일 종가부터 — 같은 날(한 판) 서른여섯 꾀 가운데 다섯 이상이 고른 회사만 산 셈 · 사는 양은 그대로 꾀마다 10주(꾀 여섯이 고르면 60주) · 꾀 넷 이하가 고른 회사는 안 삼
 *  고르는 때 = 장날 오후 1시(주문 1129-0018 · 사장님 2026-11-29(서울) 00:18 「꾀를 고를 시각을 오후 1시로 변경하고 말이야 매수할 종목 카톡은 2시에 보내고 3시에 찾아낸 종목을 당일 종가로 매수 하게 하자」 · 00:21 「응」
 *    — docs/design/noon-pick-2026-11-29/order-0018.txt · 옛 판 주문 1128-2351 「다음 장날 종가」는 이것으로 바뀜)
 *    su21.py 가 지금 시장 값(13:00 ~ 13:59)으로 다시 센 서른여섯 꾀(거래량 꾀 다섯은 뺌) = su21-s36.json noon → 장부 noon 에 그날 처음 한 번 적음 → 그날 종가로 삼
 *    11월 30일부터 · 장이 끝난 뒤 고른 꾀(s36)는 지금처럼 모두 적지만(여러 꾀가 고른 회사 · 며칠째 · 꾀 기록 자료) 11월 30일 판부터는 사지 않음
 *  파는 날(꾀마다 정한 날 · 산 다음 장날이 1일째)과 88원 규칙은 그대로(sell-v1) · 지난 기록과 들고 있는 것은 그대로(11월 27일 판까지는 지금껏처럼 그날 종가로 꾀가 고른 회사 모두)
 *  장부(s36)에는 지금처럼 꾀가 고른 회사를 모두 적음(값도 모두 적음) — 사는 셈(siteSettle)만 바꿈 · 다른 묶음(조용한 힘 · 겹친 곳 따위)은 그대로 */
export const BUY5_FROM = '2026-11-30', BUY5_NEED = 5, BUY5_ON = 'noon', NOON_HM = /^13:[0-5]\d$/; // 첫 사는 날 · 꾀 수 · 오후 1시에 고른 회사를 그날 종가로 · 고르는 때(13:00 ~ 13:59)
/** 그날 꾀 다섯 이상이 고른 회사 — x = 그날 묶음 목록 {묶음: [번호…]} · 꾀마다 한 번만 셈 */
export function pick5(x, need = BUY5_NEED) {
  const n = new Map();
  for (const k of S36) for (const c of new Set(Array.isArray(x?.[k]) ? x[k] : [])) if (CODE.test(c ?? '')) n.set(c, (n.get(c) ?? 0) + 1);
  return new Set([...n].filter(([, v]) => v >= need).map(([c]) => c));
}
const SIX = ['hot', 'bloom', 'money', 'hotNext', 'bloomNext', 'moneyNext'];
const DAY = /^\d{4}-\d{2}-\d{2}$/, CODE = /^[0-9A-Z]{6}$/;
const fin = v => typeof v === 'number' && Number.isFinite(v) && v > 0;
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const readGz = f => { try { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8')); } catch { return null; } };

export const emptySettle = () => ({schema: BOOK_SCHEMA, qty: QTY, note: '정산 장부 — 조용한 힘 일곱(그날 판) · 서른여섯 꾀 일곱씩(그날 판) · 겹친 곳(그날 판) · 회사마다 날마다 마지막 값 · 한 번 적은 날 · 값은 고치지 않음', quiet: {}, s36: {}, ovl: {}, noon: {}, px: {}, co: {}});
/** 장부 꼴 맞대기 */
export function okSettle(B) {
  return !!B && B.schema === BOOK_SCHEMA && B.qty === QTY && B.quiet && typeof B.quiet === 'object' && B.px && typeof B.px === 'object' && B.co && typeof B.co === 'object'
    && Object.entries(B.quiet).every(([d, cs]) => DAY.test(d) && Array.isArray(cs) && cs.every(c => CODE.test(c)))
    && Object.entries(B.px).every(([c, m]) => CODE.test(c) && m && typeof m === 'object' && Object.entries(m).every(([d, v]) => DAY.test(d) && fin(v)))
    && (B.t11 == null || typeof B.t11 === 'object') // 주문 1113-2033 의 옛 기록(읽으면 지움)
    && (B.s36 == null || (typeof B.s36 === 'object' && Object.entries(B.s36).every(([d, x]) => DAY.test(d) && x && typeof x === 'object'
      && Object.entries(x).every(([k, cs]) => S36.includes(k) && Array.isArray(cs) && cs.every(c => CODE.test(c))))))
    && (B.ovl == null || (typeof B.ovl === 'object' && Object.entries(B.ovl).every(([d, cs]) => DAY.test(d) && Array.isArray(cs) && cs.every(c => CODE.test(c))))) // 겹친 곳(주문 1114-0802)
    && (B.mk == null || (typeof B.mk === 'object' && Object.entries(B.mk).every(([d, f]) => DAY.test(d) && fin(f)))) // 판 전체 하루 몫(주문 1123-2358)
    && (B.noon == null || (typeof B.noon === 'object' && Object.entries(B.noon).every(([d, r]) => DAY.test(d) && r && typeof r === 'object' && NOON_HM.test(String(r.hm ?? '')) && r.g && typeof r.g === 'object'
      && Object.entries(r.g).every(([k, cs]) => S36.includes(k) && Array.isArray(cs) && cs.every(c => CODE.test(c)))))); // 오후 1시 꾀(주문 1129-0018)
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
  let added = null, added36 = [], addedO = null, addedN = null;
  // ⓪ 첫날 전 기록은 지움(주문 1112-2042) — 조용한 힘 · 값(이름은 ② 뒤에 쓰는 회사만 남김)
  const cut = {quiet: Object.keys(B.quiet).filter(d => d < start).length, px: Object.values(B.px).reduce((a, m) => a + Object.keys(m).filter(d => d < start).length, 0)};
  if (B.t11) { cut.t11 = Object.keys(B.t11).length; delete B.t11; } // 주문 1113-2224 「11 가지로 하지 말고」 — 특징 열하나 기록은 지움
  B.quiet = Object.fromEntries(Object.entries(B.quiet).filter(([d]) => d >= start));
  B.s36 = Object.fromEntries(Object.entries(B.s36).filter(([d]) => d >= start));
  B.ovl = Object.fromEntries(Object.entries(B.ovl).filter(([d]) => d >= start));
  B.noon = Object.fromEntries(Object.entries(B.noon ?? {}).filter(([d]) => d >= start));
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
  // ①'' 오후 1시 꾀(주문 1129-0018) — su21-s36.json noon(지금 시장 13:00 ~ 13:59 값으로 다시 센 서른여섯 꾀 · 거래량 꾀 다섯 뺌) · 판 날 뒤의 장중 날 · 11월 30일부터 · 그날 처음 한 번(먼저 적은 날은 그대로 · 고치지 않음)
  const nn = s36?.noon;
  if (nn && typeof nn === 'object' && DAY.test(nn.day ?? '') && nn.day >= start && nn.day >= BUY5_FROM && nn.day > (board?.asOf ?? '') && NOON_HM.test(String(nn.hm ?? '')) && nn.lists && typeof nn.lists === 'object' && !B.noon[nn.day]) {
    const g = {}; for (const k of S36) { const cs = [...new Set((Array.isArray(nn.lists[k]) ? nn.lists[k] : []).map(String).filter(c => CODE.test(c)))]; if (cs.length) g[k] = cs; }
    B.noon[nn.day] = {hm: nn.hm, at: typeof nn.at === 'string' ? nn.at : null, g}; addedN = nn.day;
    B.noon = Object.fromEntries(Object.keys(B.noon).sort().map(d => [d, B.noon[d]]));
  }
  const L = listsOf({days, sbook, su, suNext, quiet: B.quiet, s36: B.s36, ovl: B.ovl, start});
  const need = new Set([...Object.values(L).flatMap(x => Object.values(x).flat()), ...Object.values(B.noon).flatMap(r => Object.values(r.g ?? {}).flat())]); // 오후 1시 꾀가 고른 회사도 값 · 이름을 적음(그날 종가로 사려면)
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
  //    21 장날 = 장이 열린 날(cal)에서 판 날까지 21날 → 없으면 su21 cd(2026-11-24 올림 두 번 장부 mk 가 빔 — su21.json 목록 첫 cd 는 한 회사의 날(180640 · 10-23 ~ 11-23 · 쉰 날이 있어
  //    판 cFrom 10-26 과 다름)이라 거의 모든 회사가 빠짐 · 장이 열린 날을 먼저 씀)
  const calCd = (() => { const T = [...new Set((Array.isArray(cal) ? cal : []).filter(d => DAY.test(d ?? '')))].sort(), i = T.lastIndexOf(board?.asOf ?? ''); return i >= 20 ? T.slice(i - 20, i + 1) : null; })();
  const cdM = [calCd, cd].find(x => Array.isArray(x) && x.length === 21 && x[20] === board?.asOf) ?? null;
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
  return {book: B, added, added36, addedO, addedN, lists: L, cut};
}

/** 화면 자료 — 산 셈(날 · 묶음 · 번호 · 산 값) · 지금(회사마다 오늘 판 날까지 가장 늦은 값 · 그 날) · 묶음 첫날 · 다시 센 날 끝 · 못 센 수 */
export function siteSettle(B, L, asOf, days, start = START) {
  const buys = [], miss = Object.fromEntries(KINDS.map(k => [k, 0])), from = {}, now = {}, pk = {}; // pk = 장이 끝난 뒤 꾀가 고른 곳(11월 30일 판부터 — 꾀 산 셈은 오후 1시 꾀 다섯 이상만이라 「여러 꾀가 고른 회사」 · 회사 쪽 날마다 꾀 수는 이것으로 셈)
  for (const [d, x] of Object.entries(L)) {
    if (asOf && d > asOf) continue;
    const late = d >= BUY5_FROM; // 이 판부터는 장이 끝난 뒤 고른 꾀로 사지 않음 — 오후 1시 꾀 다섯 이상만 그날 종가로(주문 1128-2046 · 1129-0018 · 아래)
    if (late) { const g = Object.fromEntries(S36.filter(k => Array.isArray(x[k]) && x[k].length).map(k => [k, [...x[k]]])); if (Object.keys(g).length) pk[d] = g; }
    KINDS.forEach((k, i) => {
      if (late && S36.includes(k)) return;
      for (const code of x[k] ?? []) {
        const v = B.px?.[code]?.[d];
        if (!fin(v)) { miss[k]++; continue; }
        buys.push([d, i, code, v]); from[k] ??= d;
      }
    });
  }
  // 오후 1시 꾀 다섯 이상(주문 1129-0018) — 그날 종가로 고른 꾀마다 10주(장부 값이 있을 때 · 장이 아직이면 다음 셈에)
  const noon = Object.fromEntries(Object.entries(B.noon ?? {}).filter(([d, r]) => DAY.test(d) && d >= start && d >= BUY5_FROM && r?.g).sort(([a], [b]) => (a < b ? -1 : 1)).map(([d, r]) => [d, {hm: r.hm, g: r.g}]));
  for (const [d, r] of Object.entries(noon)) {
    if (asOf && d > asOf) continue;
    const ok5 = pick5(r.g);
    for (const k of S36) { const i = KINDS.indexOf(k);
      for (const code of new Set(Array.isArray(r.g[k]) ? r.g[k] : [])) { if (!ok5.has(code)) continue; const v = B.px?.[code]?.[d]; if (!fin(v)) { miss[k]++; continue; } buys.push([d, i, code, v]); from[k] ??= d; } }
  }
  buys.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)); // 날 차례(같은 날은 넣은 차례 그대로)
  for (const code of new Set(buys.map(b => b[2]))) {
    const last = Object.entries(B.px[code]).filter(([d]) => !asOf || d <= asOf).sort(([a], [b]) => a.localeCompare(b)).pop();
    now[code] = [last[1], last[0]];
  }
  const replay = Object.entries(days?.days ?? {}).filter(([d, x]) => x?.how === 'replay' && d >= start).map(([d]) => d).sort();
  return {schema: SCHEMA, qty: B.qty, asOf: asOf ?? null, start, kinds: [...KINDS], from, replayTo: replay[replay.length - 1] ?? null,
    co: Object.fromEntries([...new Set([...buys.map(b => b[2]), ...Object.values(pk).flatMap(g => Object.values(g).flat()), ...Object.values(noon).flatMap(r => Object.values(r.g).flat())])].sort().map(c => [c, B.co[c] ?? [c, null]])), buys, buy5: {from: BUY5_FROM, need: BUY5_NEED, on: BUY5_ON}, pk, noon, now, miss, mk: mkLevels(B, asOf, start), hz: horizons(B, buys, asOf, start), sell: sellsOf(B, buys, asOf, start)}; // sell = 사고 팔기(주문 1125-0049)
}
/** 사고 팔기(주문 1125-0049 · 사장님 2026-11-25(서울) 00:40 「이제는 매수 와 매도를 하자 · 매수는 지금처럼 하고 매도는 꾀에서 오르는 기준을 잡았잖아 그 기준 날짜로 팔고 … 매수 할때보다 12프로 하락이면 자동으로 팔게」
 *    · 00:45 「숫자로 이야기해봐」 · 00:49 「그래 이렇게 하고 … 모든 거래는 종가 기준으로 거래를 하는 것이다」 — docs/design/sell-2026-11-25/order-0049.txt)
 *  사는 것은 지금 그대로(꾀가 고른 날 종가로 10주) · 산 다음 장날 = 1일째 · 날마다 그날 종가를 봄(종가가 없는 날은 건너뛰고 장날 수만 셈)
 *  ① 100원에 산 것이 88원 이하로 마감하면 그날 종가로 팜('c' · 12프로 내림) ② 꾀마다 정한 날(SELL_DAYS)이 되면 올랐든 안 올랐든 그날 종가로 팜('d')
 *  ③ 아직 정한 날이 안 왔으면 들고 있음('h' · 가장 늦은 종가 · 산 날 뒤 종가가 없으면 산 값) · 판 돈은 다시 사지 않음
 *  정한 날 = 분석 쪽(su21-fall.json fall36-v1 · 2024-05-30 ~ 2026-08-05 내리는 장 173날) 꾀마다 「오른 뒤 절반이 끝나는 날」(가운데 날수 · 반 날은 다음 날로 올림)
 *    · 고른 것이 없거나(거래량 자료 없음 g08 · g13 · g19 · g29 · g32) 오른 날이 30번 아래(g33)인 꾀 = 아무렇게나 고른 회사의 가운데 4일째 · 이 표는 굳힘(sell-v1 · 분석을 다시 세도 안 바뀜) */
export const SELL_RULE = 'sell-v1', SELL_CUT = 88;
export const SELL_DAYS = Object.freeze({g01: 4, g02: 6, g03: 6, g04: 4, g05: 3, g06: 6, g07: 4, g08: 4, g09: 7, g10: 7, g11: 5, g12: 6, g13: 4, g14: 6, g15: 5, g16: 9, g17: 4, g18: 5,
  g19: 4, g20: 4, g21: 3, g22: 7, g23: 8, g24: 8, g25: 5, g26: 4, g27: 7, g28: 4, g29: 4, g30: 3, g31: 4, g32: 4, g33: 4, g34: 6, g35: 5, g36: 6});
/** 산 셈 하나 — px = 그 회사 {날: 종가} · tdays = 장날(차례) · i0 = 산 날 차례 · buy = 산 값(산 날 종가) · n = 정한 날 → [how, 날, 값, 며칠째] */
export function sellOne(px, tdays, i0, buy, n) {
  if (i0 == null || !fin(buy) || !(n >= 1)) return null;
  let lastD = null, lastV = null, lastK = 0;
  for (let k = 1; i0 + k < tdays.length; k++) {
    const t = tdays[i0 + k], v = px?.[t];
    if (!fin(v)) continue;
    lastD = t; lastV = v; lastK = k;
    if (v * 100 <= buy * SELL_CUT) return ['c', t, v, k];
    if (k >= n) return ['d', t, v, k];
  }
  return ['h', lastD ?? tdays[i0], lastV ?? buy, lastK];
}
/** 산 셈마다 사고 팔기 — 꾀(g01 ~ g36)가 산 셈만(다른 묶음은 null) · 장날 = 장부 값 날 ∪ 판 전체 하루 몫 날(horizons 와 같음)
 *  {rule, cut, days, s: [산 셈 차례대로 [how, 날, 값, 며칠째] | null], ex: 실제 보기 셋(정한 날 바로 그날 판 것 — 오른 것 · 안 오른 것 / 88원 줄에서 판 것 · 종가가 하루도 안 빠진 것 · 가장 이른 산 날 · 꾀 차례 · 번호 차례로 하나씩 · 산 날부터 판 날까지 종가)} */
/** 장날 = 장부 값 날 ∪ 판 전체 하루 몫 날(첫날 뒤 · 판 날까지) — 사고 팔기 · 다음 장날 사기가 같은 장날을 씀 */
export const tradeDays = (B, asOf, start = START) => [...new Set([...Object.values(B?.px ?? {}).flatMap(m => Object.keys(m ?? {})), ...Object.keys(B?.mk ?? {})])].filter(d => DAY.test(d) && d >= start && (!asOf || d <= asOf)).sort();
export function sellsOf(B, buys, asOf, start = START) {
  const tdays = tradeDays(B, asOf, start);
  const at = new Map(tdays.map((d, i) => [d, i]));
  const s = buys.map(([d, ki, code, buy]) => { const n = SELL_DAYS[KINDS[ki]]; return n ? sellOne(B?.px?.[code], tdays, at.get(d), buy, n) : null; });
  const order = s.map((x, i) => [x, i]).filter(([x]) => x).sort(([, a], [, b]) => buys[a][0].localeCompare(buys[b][0]) || buys[a][1] - buys[b][1] || buys[a][2].localeCompare(buys[b][2]));
  const full = i => { const [d, , code] = buys[i], i0 = at.get(d), i1 = at.get(s[i][1]); return i0 != null && i1 != null && tdays.slice(i0, i1 + 1).every(t => fin(B?.px?.[code]?.[t])); }; // 보기는 종가가 하루도 안 빠진 것만
  const pick = f => order.find(([x, i]) => f(x, buys[i]) && full(i))?.[1] ?? null;
  const onDay = (x, b) => x[0] === 'd' && x[3] === SELL_DAYS[KINDS[b[1]]]; // 정한 날 바로 그날 판 것
  const ex = [['up', (x, b) => onDay(x, b) && x[2] > b[3]], ['flat', (x, b) => onDay(x, b) && x[2] <= b[3]], ['cut', x => x[0] === 'c']].map(([kind, f]) => {
    const i = pick(f); if (i == null) return null;
    const [d, , code] = buys[i], i0 = at.get(d), i1 = at.get(s[i][1]);
    return {kind, i, ser: tdays.slice(i0, i1 + 1).map(t => [t, fin(B?.px?.[code]?.[t]) ? B.px[code][t] : null])};
  }).filter(Boolean);
  // 날마다 사고 팔기 셈 모두(주문 1125-2248 · 한눈에 「수익률 추이」) — 장날마다 그날까지 산 것의 산 돈(c) · 값(v: 판 것 = 판 값 · 아직 들고 있음 = 그날까지 가장 늦은 종가 · 없으면 산 값) · 서른여섯 꾀만 · 10주
  // 꾀마다 날마다(주문 1127-1412 · 사장님 2026-11-27(서울) 14:12 「꾀별로 꺾은선 그래프를 만들어 자료를 수집한 날부터 지금까지 수익률 변화를 꺾은선 그래프로 36개 전부 다해」)
  //   tk = {k: 서른여섯 꾀, c: [꾀마다 [날마다 산 돈]], v: [꾀마다 [날마다 값]]} — tt 와 같은 날 · 같은 셈을 꾀마다 나눔(그날까지 산 셈이 없는 꾀는 null) · 꾀를 모두 더하면 tt 와 같음
  const tt = {days: [], c: [], v: []}, tk = {k: [...S36], c: S36.map(() => []), v: S36.map(() => [])}, kAt = new Map(S36.map((k, j) => [KINDS.indexOf(k), j])), lastPx = new Map();
  for (const t of tdays) {
    let c = 0, v = 0, n = 0; const cK = S36.map(() => 0), vK = S36.map(() => 0);
    buys.forEach(([d, ki, code, buy], i) => {
      const x = s[i]; if (!x || !(buy > 0) || d > t) return;
      const px = B?.px?.[code]?.[t]; if (fin(px)) lastPx.set(i, px);
      const cb = buy * QTY, vb = (x[0] !== 'h' && x[1] <= t ? x[2] : lastPx.get(i) ?? buy) * QTY, j = kAt.get(ki);
      c += cb; v += vb; n++;
      if (j != null) { cK[j] += cb; vK[j] += vb; }
    });
    if (n) { tt.days.push(t); tt.c.push(Math.round(c)); tt.v.push(Math.round(v)); S36.forEach((_, j) => { tk.c[j].push(cK[j] > 0 ? Math.round(cK[j]) : null); tk.v[j].push(cK[j] > 0 ? Math.round(vK[j]) : null); }); }
  }
  // 회사마다 날마다 종가(주문 1127-2306 · 사장님 2026-11-27(서울) 23:06 「그래 1시간 안에 작업 해」 — 「회사 줄마다 그 회사 값 꺾은선도 작게 붙여 볼까요?」의 답)
  //   px = {d: 장날(start 부터), c: {회사: [날마다 종가 | null]}} — 산 셈이 있는 회사만 · 화면은 산 날부터 판 날(들고 있으면 가장 늦은 날)까지 이어 그림
  const px = {d: [...tdays], c: Object.fromEntries([...new Set(buys.filter((b, i) => s[i]).map(b => b[2]))].sort().map(code => [code, tdays.map(t => (fin(B?.px?.[code]?.[t]) ? B.px[code][t] : null))]))};
  return {rule: SELL_RULE, cut: SELL_CUT, days: {...SELL_DAYS}, s, ex, tt, tk, px};
}
/** 같은 날수로 재기(주문 1124-0226 · 사장님 2026-11-24(서울) 02:26 「어 1시간 이내에 작업 해봐」 — 「다음에는 2번 「같은 날수로 재기」를 넣어 볼까요?」의 답 · 장부 잣대 2번)
 *  산 셈마다 산 날 뒤 1 · 5 · 20 장날의 값(그 회사의 그날까지 가장 늦은 값 · 판 날 뒤는 안 셈) — 「지금」은 산 날마다 지난 날수가 달라 견주기 어려움
 *  {ks, days: {산 날: [하루 뒤 날 · 닷새 뒤 날 · 스무 날 뒤 날 | null]}, p: [산 셈 차례대로 [값 | null × 3]]} · 장날 = 장부 값 날 ∪ 판 전체 하루 몫 날(mkLevels 와 같음) */
export const HZ_KS = Object.freeze([1, 5, 20]);
export function horizons(B, buys, asOf, start = START) {
  const tdays = [...new Set([...Object.values(B?.px ?? {}).flatMap(m => Object.keys(m ?? {})), ...Object.keys(B?.mk ?? {})])].filter(d => DAY.test(d) && d >= start && (!asOf || d <= asOf)).sort();
  const at = new Map(tdays.map((d, i) => [d, i])), days = {};
  for (const [d] of buys) days[d] ??= HZ_KS.map(k => { const i = at.get(d); return i == null || i + k >= tdays.length ? null : tdays[i + k]; });
  const last = (code, t) => { let v = null, vd = ''; for (const [x, y] of Object.entries(B?.px?.[code] ?? {})) if (x <= t && fin(y) && x > vd) { vd = x; v = y; } return v; };
  return {ks: [...HZ_KS], days, p: buys.map(([d, , code]) => days[d].map(t => (t ? last(code, t) : null)))};
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
  const {book, added, added36, addedO, addedN, lists, cut} = stepSettle(readJson(bookF), {su: S, suNext: N, board, stored, sbook, days, s36, cal});
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
    + (addedN ? ' · 오후 1시 꾀 새로 적음 ' + addedN + ' ' + book.noon[addedN].hm + '(꾀 ' + Object.keys(book.noon[addedN].g).length + '가지)' : '')
    + ' · 첫 쪽 기록 ' + U.length + '줄' + (sunAdded ? '(새로 ' + sunAdded + ')' : '') + (sunBroken ? ' · 첫 쪽 기록 지문 끊김 ' + sunBroken : '') + ' · 날마다 기록 ' + T.length + '줄' + (sealed.length ? '(새로 ' + sealed.join(' · ') + ')' : '') + (broken ? ' · 지문 끊김 ' + broken : '') + (diff.length ? ' · 다시 센 값 다름 ' + diff.join(' · ') : '') + (keep ? ' · 장부 씀' : ' · 장부 안 씀(올리기 작업 아님)') + ' · 며칠째 꾀 ' + M.n36 + '곳 · 조용한 힘 ' + M.nq + '곳 · 겹친 곳 ' + M.no + '곳');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

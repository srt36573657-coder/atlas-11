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
//   쓰는 곳: reports/atlas11/su21/settle.json(장부 — 올리기 작업 site · daily · evening 만 --keep) · <su>/su21-settle.json(화면)
//   쓰는 법: node scripts/atlas11/next/su21_settle.mjs --su <dist/su/data> --board <board.json> --days <reports/atlas11/su21/days.json> --book <reports/atlas11/su21/settle.json>
//            [--boards <reports/atlas11/su21/boards>] [--keep] [--out <파일>]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

export const SCHEMA = 'su21-settle-1', BOOK_SCHEMA = 'su21-settle-book-1', QTY = 10;
/** 정산 첫날(주문 1112-2042 「정산을 오늘 부터 한다」 — 받은 날 11월 12일 판) */
export const START = '2026-11-12';
export const KINDS = Object.freeze(['top3', 'hot', 'bloom', 'money', 'quiet', 'hotNext', 'bloomNext', 'moneyNext']);
const SIX = ['hot', 'bloom', 'money', 'hotNext', 'bloomNext', 'moneyNext'];
const DAY = /^\d{4}-\d{2}-\d{2}$/, CODE = /^[0-9A-Z]{6}$/;
const fin = v => typeof v === 'number' && Number.isFinite(v) && v > 0;
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const readGz = f => { try { return JSON.parse(zlib.gunzipSync(fs.readFileSync(f)).toString('utf8')); } catch { return null; } };

export const emptySettle = () => ({schema: BOOK_SCHEMA, qty: QTY, note: '정산 장부 — 조용한 힘 일곱(그날 판) · 회사마다 날마다 마지막 값 · 한 번 적은 날 · 값은 고치지 않음', quiet: {}, px: {}, co: {}});
/** 장부 꼴 맞대기 */
export function okSettle(B) {
  return !!B && B.schema === BOOK_SCHEMA && B.qty === QTY && B.quiet && typeof B.quiet === 'object' && B.px && typeof B.px === 'object' && B.co && typeof B.co === 'object'
    && Object.entries(B.quiet).every(([d, cs]) => DAY.test(d) && Array.isArray(cs) && cs.every(c => CODE.test(c)))
    && Object.entries(B.px).every(([c, m]) => CODE.test(c) && m && typeof m === 'object' && Object.entries(m).every(([d, v]) => DAY.test(d) && fin(v)));
}
const indOf = c => c?.group?.industry ?? c?.group?.label ?? c?.ind ?? null;

/** 날마다 묶음 목록 — {날: {묶음: [번호…]}} · 여섯은 days.json(그날 판 날이 없고 su21 이 그 판이면 그날 su21 목록) · top3 = 달력 장부 · quiet = 장부 */
export function listsOf({days, sbook, su, suNext, quiet, start = START}) {
  const out = {}, put = (d, k, cs) => { if (!DAY.test(d ?? '') || d < start || !Array.isArray(cs) || !cs.length) return; ((out[d] ??= {})[k] = cs.filter(c => CODE.test(c))); };
  for (const [d, x] of Object.entries(days?.days ?? {})) for (const k of SIX) put(d, k, x?.lists?.[k]);
  const sd = su?.asOf?.board;
  if (DAY.test(sd ?? '') && !days?.days?.[sd]) for (const k of SIX) put(sd, k, ((k.endsWith('Next') ? suNext?.lists?.[k] ?? su?.lists?.[k] : su?.lists?.[k]) ?? []).map(c => c.code));
  for (const x of sbook?.days ?? []) put(x.board, 'top3', [...(x.picks ?? [])].sort((a, b) => a.place - b.place).map(p => p.code));
  for (const [d, cs] of Object.entries(quiet ?? {})) put(d, 'quiet', cs);
  return Object.fromEntries(Object.keys(out).sort().map(d => [d, out[d]]));
}

/** 장부 한 걸음 — 조용한 힘 그날 일곱 · 이름 · 업종 · 값 적기 · {book, added, cut}(들어온 장부는 바꾸지 않음)
 *  su = su21.json · board = 오늘 판(board.json) · stored = {날: 저장된 판} · sbook = su21-book.json · days = days.json · start = 정산 첫날 */
export function stepSettle(book0, {su, suNext, board, stored = {}, sbook, days, start = START}) {
  const B = JSON.parse(JSON.stringify(okSettle(book0) ? book0 : emptySettle()));
  let added = null;
  // ⓪ 첫날 전 기록은 지움(주문 1112-2042) — 조용한 힘 · 값(이름은 ② 뒤에 쓰는 회사만 남김)
  const cut = {quiet: Object.keys(B.quiet).filter(d => d < start).length, px: Object.values(B.px).reduce((a, m) => a + Object.keys(m).filter(d => d < start).length, 0)};
  B.quiet = Object.fromEntries(Object.entries(B.quiet).filter(([d]) => d >= start));
  for (const code of Object.keys(B.px)) { B.px[code] = Object.fromEntries(Object.entries(B.px[code]).filter(([d]) => d >= start)); if (!Object.keys(B.px[code]).length) delete B.px[code]; }
  // ① 조용한 힘 일곱 — 그날 판(su21.json asOf.board)으로 한 번 적음(먼저 적은 날은 그대로) · su21 판 날 = 오늘 판 날일 때만(묵은 su21 로 지난 날을 적지 않음 — 11-13 08:59 묵은 판이 11월 6일을 적은 일)
  const sd = su?.asOf?.board, q = (su?.lists?.quiet ?? []).map(c => c?.code).filter(c => CODE.test(c ?? ''));
  if (DAY.test(sd ?? '') && sd >= start && sd === board?.asOf && q.length && !B.quiet[sd]) { B.quiet[sd] = q; added = sd; B.quiet = Object.fromEntries(Object.keys(B.quiet).sort().map(d => [d, B.quiet[d]])); }
  const L = listsOf({days, sbook, su, suNext, quiet: B.quiet, start});
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
  return {book: B, added, lists: L, cut};
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
    co: Object.fromEntries([...new Set(buys.map(b => b[2]))].sort().map(c => [c, B.co[c] ?? [c, null]])), buys, now, miss};
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
  const su = arg('--su'), boardF = arg('--board'), daysF = arg('--days'), bookF = arg('--book'), keep = a.includes('--keep');
  const boardsDir = arg('--boards') ?? path.join(ROOT, 'reports/atlas11/su21/boards'), out = arg('--out') ?? (su ? path.join(su, 'su21-settle.json') : null);
  if (!su || !boardF || !daysF || !bookF) { console.error('--su · --board · --days · --book 이 필요함'); process.exit(2); }
  const S = readJson(path.join(su, 'su21.json')), N = readJson(path.join(su, 'su21-next.json')), board = readJson(boardF), days = readJson(daysF), sbook = readJson(path.join(su, 'su21-book.json'));
  if (!board || !Array.isArray(board.companies)) { console.error('판을 못 읽음'); process.exit(1); }
  const stored = storedBoards(boardsDir);
  const {book, added, lists, cut} = stepSettle(readJson(bookF), {su: S, suNext: N, board, stored, sbook, days});
  const site = siteSettle(book, lists, board.asOf, days);
  if (out) fs.writeFileSync(out, JSON.stringify(site) + '\n');
  if (keep) { const tmp = bookF + '.tmp' + process.pid; fs.writeFileSync(tmp, JSON.stringify(book, null, 1) + '\n'); fs.renameSync(tmp, bookF); }
  const nk = Object.fromEntries(KINDS.map(k => [k, site.buys.filter(b => KINDS[b[1]] === k).length]));
  console.log(`정산 장부 — 날 ${Object.keys(lists).length} · 산 셈 ${site.buys.length}번(${KINDS.map(k => k + ' ' + nk[k]).join(' · ')}) · 값 없음 ${Object.values(site.miss).reduce((x, y) => x + y, 0)} · 저장된 판 ${Object.keys(stored).length} · 판 ${board.asOf}`
    + ' · 첫날 ' + START + (cut.quiet || cut.px || cut.co ? ` · 첫날 전 기록 지움(조용한 힘 ${cut.quiet}날 · 값 ${cut.px}개 · 이름 ${cut.co ?? 0}곳)` : '')
    + (added ? ' · 조용한 힘 새로 적음 ' + added : '') + (keep ? ' · 장부 씀' : ' · 장부 안 씀(올리기 작업 아님)'));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

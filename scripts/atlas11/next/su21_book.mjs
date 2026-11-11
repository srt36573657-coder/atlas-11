#!/usr/bin/env node
// 큐피트 1 · 2 · 3등 장부(주문 0938 · 사장님 2026-11-10 09:38 「자 달력을 만들어 1.2.3달력을 그리고 찾아낸 그날부터해서 첫페이지처럼 표현햐서 추적해
//   그리고 10주씩 무조건 매수해 그리고 나서 수익율률을 추적하기 해봐 잡스라면」)
//   판마다 큐피트 계산법 1등 · 2등 · 3등(su21.json top3.rank)을 그 판 날 마지막 값으로 10주씩 산 셈으로 적음 — 가짜 돈 · 진짜 돈이 오가지 않음
//   한 번 적은 판 날은 고치지 않음(처음 본 1 · 2 · 3등 그대로) · 산 뒤에는 팔지 않고 들고 있다고 침
//   값 = 오늘 판(public/data/atlas11/view/board.json) companies 의 close · c(21 마지막 값) · cFrom — 적은 회사마다 산 날부터 판 날마다 마지막 값(빈 날은 21 값으로 채움)
//   쓰는 곳: reports/atlas11/su21/book.json(올리기 작업 site · daily · evening 만 --keep · 그 작업이 reports/ 를 저장소에 넣음) · <su>/su21-book.json(화면 — 사장님 휴대폰에서만 그림)
//   쓰는 법: node scripts/atlas11/next/su21_book.mjs --su <dist/su/data> --board <board.json> --book <reports/atlas11/su21/book.json> [--keep] [--out <파일>]
//   --rank quiet(주문 1111-1334 · 사장님 2026-11-11 13:34 「… 이것을 ㅊ 적하는 별도에 달력을 만들어라」) — 넷째 창 「조용한데 힘이 모이는」 1 · 2 · 3등(su21.json quiet.rank)
//     따로 된 장부 reports/atlas11/su21/qbook.json · 화면 <su>/su21-qbook.json · 꼴 · 셈은 같음(kind = 'quiet')
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const SCHEMA = 'su21-book-1', QTY = 10;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const fin = v => typeof v === 'number' && Number.isFinite(v) && v > 0;
const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };

/** 빈 장부 */
export const emptyBook = (kind = 'top3') => ({schema: SCHEMA, qty: QTY, kind, note: (kind === 'quiet' ? '조용한데 힘이 모이는 창 1등 · 2등 · 3등(몬테카를로 차례)' : '큐피트 계산법 1등 · 2등 · 3등') + '을 그 판 날 마지막 값으로 10주씩 산 셈(가짜 돈) · 한 번 적은 판 날은 고치지 않음 · 팔지 않고 들고 있다고 침', days: [], px: {}});
/** 장부마다 1 · 2 · 3등을 읽는 곳 — top3 = 42칸 1억 번 셈(주문 1422) · quiet = 넷째 창 차례 첫 셋(주문 1111-1334) */
const RANK = {top3: T => T?.top3?.rank, quiet: T => T?.quiet?.rank};
const RULE = {top3: T => (T?.top3?.v === 'up3-v1' ? 'up3-v1' : T?.listRule ?? null), quiet: T => T?.quiet?.rule ?? null}; // 주문 1111-1857 — 새 잣대 날은 'up3-v1'(화면이 「새 잣대」 표)

/** 장부 꼴 맞대기 — 날마다 셋 · 등수 1 ~ 3 · 값 · 번호 꼴 */
export function okBook(B) {
  if (!B || B.schema !== SCHEMA || B.qty !== QTY || !Array.isArray(B.days) || typeof B.px !== 'object' || !B.px) return false;
  return B.days.every(d => DAY.test(d?.board ?? '') && Array.isArray(d.picks) && d.picks.length === 3
    && d.picks.every((p, i) => p && p.place === i + 1 && /^[0-9A-Z]{6}$/.test(p.code) && typeof p.name === 'string' && p.name && typeof p.k === 'string' && fin(p.px)));
}

/** 오늘 판으로 장부를 한 걸음 — {book, added, marked} (book 은 새 것 · 들어온 것은 바꾸지 않음)
 *  T = su21.json · board = 판(companies) · now = 처음 본 때(ISO) */
const kst = (d = new Date()) => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 16) + '+09:00'; // 처음 본 때는 서울 시각(화면 「○월 ○일에 처음 뽑혔어요」가 서울 날로 맞댐 · 주문 0040 때 고침)
export function stepBook(book0, T, board, now = kst(), kind = 'top3') {
  const B = JSON.parse(JSON.stringify(okBook(book0) ? book0 : emptyBook(kind)));
  const co = new Map((board?.companies ?? []).map(c => [c.code, c]));
  const day = T?.asOf?.board, rank = RANK[kind](T);
  // 판 날 마지막 값 — 판(board)이 그 날이면 판에서 · 아니면 그 1 · 2 · 3등을 낸 su21.json 칸의 그날 값(close · date — 같은 판에서 나온 값)
  //   예) 묶음에 저장된 옛 su21.json(셈이 멈춘 묶음 · 검사 실행기)과 새 판이 다른 날일 때 — 그 판 날로 적고, 처음 본 때가 늦으면 화면이 「판 날보다 늦게 보였어요」라고 씀
  //   새 잣대(주문 1111-1857)는 42칸 밖 회사도 고름 — 그 판 날 값은 1 · 2 · 3등 줄(close · date)에서
  const snap = board?.asOf === day ? null : new Map([...(Array.isArray(rank) ? rank : []), ...Object.values(T?.lists ?? {}).flat()].filter(x => x?.code && x.date === day && fin(x.close)).map(x => [x.code, x]));
  const at = code => (snap ? snap.get(code) : co.get(code));
  let added = null;
  if (DAY.test(day ?? '') && Array.isArray(rank) && rank.length >= 3 && !B.days.some(d => d.board === day)) {
    const picks = [1, 2, 3].map(pl => rank.find(r => r.place === pl)).map(r => { const c = r && at(r.code); return r && c && fin(c.close) && c.date === day ? {place: r.place, k: r.k, code: r.code, name: c.name ?? r.name, px: c.close} : null; });
    if (picks.every(Boolean)) { added = {board: day, seen: now, rule: RULE[kind](T), picks}; B.days.push(added); B.days.sort((a, b) => a.board.localeCompare(b.board)); }
  }
  // 값 적기 — 산 날부터(그 회사가 처음 들어간 판 날) 판의 21 마지막 값 · 오늘 값
  const first = {};
  for (const d of B.days) for (const p of d.picks) if (!first[p.code] || d.board < first[p.code]) first[p.code] = d.board;
  let marked = 0;
  for (const [code, d0] of Object.entries(first)) {
    const c = co.get(code); if (!c) continue;
    const m = (B.px[code] ??= {}), buy = new Set();
    for (const d of B.days) for (const p of d.picks) if (p.code === code) { m[d.board] = p.px; buy.add(d.board); } // 산 날 값은 산 값 그대로(같은 판 날을 다시 묶어 값이 달라도 바꾸지 않음 — 산 값 = 값 줄의 그 날 값)
    const cd = Array.isArray(T?.cdays) ? T.cdays : null;
    if (Array.isArray(c.c) && c.c.length === 21 && cd && cd.length === 21 && cd[20] === c.date && cd[0] === c.cFrom) cd.forEach((dd, j) => { if (dd >= d0 && fin(c.c[j]) && m[dd] == null) { m[dd] = c.c[j]; marked++; } });
    if (DAY.test(c.date ?? '') && c.date >= d0 && fin(c.close) && !buy.has(c.date)) { if (m[c.date] !== c.close) marked++; m[c.date] = c.close; }
  }
  for (const code of Object.keys(B.px)) B.px[code] = Object.fromEntries(Object.entries(B.px[code]).sort(([a], [b]) => a.localeCompare(b)));
  return {book: B, added, marked};
}

/** 화면 자료 — 판 날 · 날마다 셋 · 회사마다 [날, 값] */
export const siteBook = (B, asOf) => ({schema: SCHEMA, asOf: [asOf, ...B.days.map(d => d.board)].filter(x => DAY.test(x ?? '')).sort().pop() ?? null, // 판 날(장부 맨 끝 날보다 앞이면 맨 끝 날 — 옛 판으로 묶은 때)
  ...(B.kind === 'quiet' ? {kind: 'quiet'} : {}), qty: B.qty, days: B.days, px: Object.fromEntries(Object.entries(B.px).map(([k, m]) => [k, Object.entries(m)]))});

function main() {
  const a = process.argv.slice(2), arg = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  const kind = arg('--rank') === 'quiet' ? 'quiet' : 'top3';
  const su = arg('--su'), boardF = arg('--board'), bookF = arg('--book'), keep = a.includes('--keep'), out = arg('--out') ?? (su ? path.join(su, kind === 'quiet' ? 'su21-qbook.json' : 'su21-book.json') : null);
  if (!su || !boardF || !bookF) { console.error('--su · --board · --book 이 필요함'); process.exit(2); }
  const T = readJson(path.join(su, 'su21.json')), N = readJson(path.join(su, 'su21-next.json')), board = readJson(boardF);
  if (!T || !board) { console.error('su21.json · 판을 못 읽음'); process.exit(1); }
  // 21 날 — 오늘 판 칸의 cd(첫 페이지 꺾은선과 같은 날들) · 없으면 될 듯 판
  T.cdays = Object.values(T.lists ?? {}).flat().concat(Object.values(N?.lists ?? {}).flat()).find(x => Array.isArray(x?.cd) && x.cd.length === 21 && x.cd[20] === T?.asOf?.board)?.cd ?? null;
  const book0 = readJson(bookF);
  const {book, added, marked} = stepBook(book0, T, board, kst(), kind);
  if (out) fs.writeFileSync(out, JSON.stringify(siteBook(book, T?.asOf?.board ?? null)) + '\n');
  if (keep) fs.writeFileSync(bookF, JSON.stringify(book, null, 1) + '\n');
  console.log(`${kind === 'quiet' ? '조용한 힘 ' : ''}1 · 2 · 3등 장부 — 판 ${book.days.length}날 · 회사 ${Object.keys(book.px).length}곳 · ${added ? '새로 적음 ' + added.board + ' ' + added.picks.map(p => p.place + '등 ' + p.name).join(' · ') : '새로 적은 판 없음'} · 값 ${marked}개 · ${keep ? '장부 씀' : '장부 안 씀(올리기 작업 아님)'}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

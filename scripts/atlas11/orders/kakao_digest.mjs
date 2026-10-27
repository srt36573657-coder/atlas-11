#!/usr/bin/env node
// 주문 장부 → 카톡 요약(사장님 2026-10-22 01:29 「이방애 주문 주었던 것을 내 카톡애 요약해서 다 보내고 글고 미완성 완성 성공에 값 해쓰느지 보고체게 시스템화 한다」)
//   장부 = reports/atlas11/orders/ledger.json(주문마다 원문 · 때 · 한 일 · 상태 미완성 · 완성 · 성공 · 근거 · 짧은 글)
//   카톡 「나에게 보내기」는 한 통에 200자까지 — 이 셈이 200자 안으로 나눈 글 묶음을 JSON 줄로 냄(보내기는 카톡 도구가 함 · 이 파일은 글만 만듦)
//   쓰는 법: node scripts/atlas11/orders/kakao_digest.mjs [--ledger 파일] [--only 미완성]
//   글은 쉬운 말 — 상태 · 때 · 짧은 글(short) 하나씩 · 맨 앞은 수 · 맨 끝은 남은 일
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NAME} from '../../../site/next/brand.js'; // 이름 한 곳(규칙 76 · 2026-10-27 21:50 「돌이 를 둘이 로 변경해라」)

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const MAX = 200, ORDER = ['미완성', '완성', '성공'];

/** 때 → 「21일 오후 5시 51분」 */
export function when(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso || ''); if (!m) return '?';
  const h = +m[4], ap = h < 12 ? '오전' : '오후', h12 = h % 12 || 12;
  return `${+m[3]}일 ${ap} ${h12}시${+m[5] ? ' ' + (+m[5]) + '분' : ''}`;
}
/** 장부 → 카톡 글 묶음(한 통 200자 안) */
export function digest(L, {only = null} = {}) {
  const os = L.orders.filter(o => !only || o.state === only);
  const n = s => os.filter(o => o.state === s).length;
  const out = [`${NAME} 주문 장부예요. 주문은 모두 ${os.length}건이에요.\n성공 ${n('성공')}건, 완성 ${n('완성')}건이에요. 미완성은 ${n('미완성')}건이에요.\n성공은 진짜 사이트에서 확인한 것이에요.\n완성은 만들어 올린 것이에요.\n미완성은 아직인 것이에요.`]; // 한 문장 숫자 셋까지(쉬운 말 문)
  const rows = [...os].sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state) || String(a.at).localeCompare(String(b.at)))
    .map(o => `[${o.state}] ${when(o.at)}\n${o.short}`);
  let cur = '';
  for (const r of rows) { if (cur && (cur + '\n\n' + r).length > MAX) { out.push(cur); cur = ''; } cur = cur ? cur + '\n\n' + r : r; }
  if (cur) out.push(cur);
  if (!only && L.open?.length) {
    let c = '남은 일이에요.';
    for (const x of L.open) { const line = '\n- ' + x.replace(/[()]/g, ''); if ((c + line).length > MAX) { out.push(c); c = '남은 일 이어서예요.'; } c += line; }
    out.push(c);
  }
  return out.map(s => s.slice(0, MAX));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const L = JSON.parse(fs.readFileSync(arg('--ledger', path.join(ROOT, 'reports/atlas11/orders/ledger.json')), 'utf8'));
  for (const m of digest(L, {only: arg('--only', null)})) console.log(JSON.stringify(m));
}

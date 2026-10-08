/* ATLAS 11 · 빠짐없이 도는 검사기 v3 ② 계산 층 — 따로 도는 일꾼(브라우저 일과 겹쳐 돌게 · 2026-10-08 06:42 「10배 빠르게」)
   한국어로 그린 모든 화면의 글을 사이트 번역 함수 그대로(i18n.js · 다섯 판 이름 더하기까지) 73개 말로 바꿔 남은 한국어를 셈
   빠르게: 숫자 모양 · 한글 회사 이름을 눌러 「모양」으로 묶어 한 번씩 봄 → 모양에서 한국어가 남으면 그 모양의 원래 글을 하나하나(판정은 원래 글로)
   말 하나가 끝날 때마다 바깥에 알림(남은 글 · 사전에 없는 틀 · 한국 판에서 그 말로 글이 가장 긴 화면 — ③ 가장 긴 글 층이 바로 엶) */
import {parentPort, workerData} from 'node:worker_threads';
import path from 'node:path';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const {root, codes, texts, boards, namesKr, krLay} = workerData;
const HAN = /[가-힣]/;
const shapeOf = s => s.replace(/\d{1,2}:\d{2}/g, '11:11').replace(/\d{4}(?=년)/g, '1111').replace(/\d{1,3}(?:,\d{3})+/g, '1,111').replace(/\d+/g, '1');
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// 회사 이름(두 글자 넘게 · 어느 글자든)은 다 같은 이름 자리({e})가 되므로 한 이름으로 눌러 묶음 — 번역 함수와 같은 경계(앞뒤가 글자가 아님 · 뒤 조사 하나는 됨)일 때만
const WORD = /[A-Za-z0-9가-힣]/, PARTICLE = /^[은는이가의을를도와과에로만]/;
const okEdge = (s, i, len) => { const prev = s[i - 1] ?? '', next = s.slice(i + len); if (prev && WORD.test(prev)) return false; return !next || !WORD.test(next[0]) || PARTICLE.test(next) && !WORD.test(next[1] ?? ''); };
const names = [...new Set(boards.flatMap(b => b.companies.map(c => c.name)))].filter(n => n && n.length >= 2).sort((a, b) => b.length - a.length);
const nameRe = names.length ? new RegExp(names.map(esc).join('|'), 'g') : null, CANON = '삼성전자';
const squash = s => (nameRe ? s.replace(nameRe, (m0, i, all) => (okEdge(all, i, m0.length) ? CANON : m0)) : s);
const byShape = new Map();
for (const s of texts) { const k = shapeOf(squash(s)); if (!byShape.has(k)) byShape.set(k, []); byShape.get(k).push(s); }
const wide = s => { let w = 0; for (const ch of s) { const c = ch.codePointAt(0); w += (c >= 0x1100 && c <= 0x11FF) || (c >= 0x2E80 && c <= 0xA4CF) || (c >= 0xAC00 && c <= 0xD7A3) || (c >= 0xF900 && c <= 0xFAFF) || (c >= 0xFF00 && c <= 0xFF60) ? 2 : 1; } return w; };
parentPort.postMessage({type: 'shapes', shapes: byShape.size});
for (const code of codes) {
  globalThis.location = {pathname: '/', search: `?lang=${code}`};
  const m = await import(pathToFileURL(path.join(root, 'site/app/i18n.js')).href + `?lang=${encodeURIComponent(code)}`);
  m.useDict(JSON.parse(await fs.readFile(path.join(root, 'site/app/i18n', code + '.json'), 'utf8')));
  for (const bd of boards) m.addBoardNames(structuredClone(bd), namesKr);
  const left = [];
  for (const [k, xs] of byShape) if (HAN.test(m.t(k))) for (const x of xs) if (HAN.test(m.t(x))) left.push(x);
  // 한국 판에서 그 말로 한 화면 글이 가장 긴 화면(화면 종류마다)
  const best = {}; for (const p of krLay) { const sc = p.lay.reduce((s, x) => s + wide(m.t(x)), 0); if (!best[p.kind] || sc > best[p.kind].sc) best[p.kind] = {...p, sc}; }
  parentPort.postMessage({type: 'lang', code, nLeft: left.length, left: left.slice(0, 8), worst: Object.values(best).map(p => ({kind: p.kind, id: p.id, hash: p.hash}))});
}
parentPort.postMessage({type: 'done'});

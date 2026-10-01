#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 · 고리 감시 한 줄 (명령문 <감시> S1~S10 · 꼴은 spec/board.md 「감시 한 줄」)
 *
 *   node atlas4h/loop/watch.mjs [--root DIR] [--now ISO]
 *
 * 감시 줄이 아직 없는 고리 한 줄마다 감시 한 줄을 ledger/watch/<한국 날짜>.jsonl 에 덧붙인다(by = 「감시 스크립트」 — 짓는 일꾼 이름이 아님 · T23).
 * 스크립트가 기계로 잴 수 있는 것만 숫자로 적는다. 판단이 드는 줄은 「잴 수 없음 — 다른 에이전트 몫」으로 적는다(0 으로 꾸미지 않는다).
 *   S1 A~F 여섯 칸 중 빈 칸 수(판의 structures)          — 숫자
 *   S2 구조 번호가 빠진 답 수(판·고리 한 줄)              — 숫자
 *   S3 [짐작] 위에 세운 [판단] 수                          — 잴 수 없음(글의 뜻을 읽어야 함)
 *   S4 출처 없는 숫자 수(값이 있는데 출처가 0개인 변수)    — 숫자 (글 속 숫자의 출처는 못 잼 → note)
 *   S5 동의만 하는 문장 수                                  — 잴 수 없음
 *   S6 확인 없이 80% 넘긴 곳                               — 잴 수 없음 (80% 넘는 확률 개수만 note 에 셈)
 *   S7 봉인 뒤 정보가 섞인 곳(판 입력 시각·장·ATLAS 11 발행 시각 > 봉인) — 숫자
 *   S8 같은 자료로 고치고 채점한 곳                         — 잴 수 없음(엔진을 무엇으로 맞췄는지 읽어야 함)
 *   S9 감시가 잡은 것이 점수를 낫게 했나 · S10 할 일 열셋 중 지킨 수 — 잴 수 없음(기록)
 * 곁 확인(checks): 봉인 지문 · 금지 말 · 장부 덧붙이기만(깃 HEAD 와 견줘 지운 줄 수).
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {boardSha256, FORBIDDEN} from '../spec/checks.mjs';
import {isoKst} from '../engine/clock.mjs';
import {readLedger, appendLine, REPO} from './run.mjs';

export const WATCH_BY = '감시 스크립트';
export const CANNOT = '잴 수 없음 — 다른 에이전트 몫';
const TIME_KEYS = new Set(['observedAt', 'fetchedAt', 'asOf', 'measuredAt']);

function walkTimes(v, fn) {
  if (Array.isArray(v)) v.forEach(x => walkTimes(x, fn));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) (TIME_KEYS.has(k) ? fn(x) : walkTimes(x, fn));
}

/** 깃 HEAD 와 견줘 장부에서 지워진 줄 수 (덧붙이기만인지) — 깃이 없으면 null */
export function removedLedgerLines(root) {
  try {
    const out = execFileSync('git', ['-C', root, 'diff', '-U0', 'HEAD', '--', 'atlas4h/ledger'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024});
    return out.split('\n').filter(l => l.startsWith('-') && !l.startsWith('---')).length;
  } catch {
    return null;
  }
}

/** 고리 한 줄 → 감시 한 줄 */
export function watchRow(loop, {board, seal, baselines, removed, nowIso}) {
  const notes = [];
  const S = {};
  if (!board) {
    S.S1 = 0;
    S.S2 = Array.isArray(loop.structures) && loop.structures.length ? 0 : 1;
    notes.push(`판 없음(${loop.status}) — S1 은 판이 없어 0 · S2 는 고리 한 줄의 구조 번호만 봄`);
  } else {
    const letters = new Set((board.structures ?? []).filter(x => /^[A-F][1-6]$/.test(String(x))).map(x => x[0]));
    S.S1 = ['A', 'B', 'C', 'D', 'E', 'F'].filter(x => !letters.has(x)).length;
    S.S2 = (Array.isArray(board.structures) && board.structures.length ? 0 : 1) + (Array.isArray(loop.structures) && loop.structures.length ? 0 : 1);
  }
  S.S3 = CANNOT;
  if (board) {
    S.S4 = (board.inputs?.variables ?? []).filter(v => v.value !== null && v.value !== undefined && !(v.sources ?? []).length).length;
    notes.push('S4 는 변수 값만 셈 — 판 글(text) 속 숫자의 출처는 스크립트가 못 잼');
  } else S.S4 = 0;
  S.S5 = CANNOT;
  S.S6 = CANNOT;
  if (board) {
    const ps = [];
    const add = d => d && Object.values(d).forEach(x => typeof x === 'number' && ps.push(x));
    add(board.kospi?.direction);
    (board.kospi?.scenarios ?? []).forEach(s => ps.push(s.prob));
    (board.stocks ?? []).forEach(s => add(s.direction));
    notes.push(`S6 참고: 판 속 80% 넘는 확률 ${ps.filter(p => p > 0.8).length}개 (확인했는지는 판단 몫)`);
  }
  let s7 = 0;
  if (board) {
    const cut = Math.min(Date.parse(board.sealedAt), Date.parse(board.dataCutoff));
    walkTimes(board.inputs, t => { if (typeof t === 'string' && Date.parse(t) > cut) s7++; });
    if (board.kospi?.anchor?.asOf && Date.parse(board.kospi.anchor.asOf) > cut) s7++;
    for (const u of Object.values(baselines?.units ?? {})) {
      const a = u['ATLAS 11'];
      if (a && !a.none && !(Date.parse(a.issuedAt) < Date.parse(board.sealedAt))) s7++;
    }
  }
  S.S7 = s7;
  S.S8 = CANNOT;
  const forbidden = [];
  const scan = v => {
    if (typeof v === 'string') {
      for (const f of FORBIDDEN) if (f.re.test(v)) forbidden.push(f.word);
    } else if (Array.isArray(v)) v.forEach(scan);
    else if (v && typeof v === 'object') Object.values(v).forEach(scan);
  };
  if (board) scan(board);
  scan(loop);
  return {
    schema: 'atlas4h-watch-1', loopId: loop.loopId, at: nowIso, by: WATCH_BY, boardId: loop.boardId ?? null,
    S, S9: {caught: null, improved: null, note: CANNOT}, S10: {kept: null, of: 13, note: CANNOT},
    checks: {
      sealMatches: board ? (seal ? seal.sha256 === boardSha256(board) : false) : null,
      forbiddenWords: forbidden.length,
      ledgerRemovedLines: removed,
      ...(removed === null ? {ledgerRemovedNote: '깃이 없어 못 잼'} : {}),
    },
    notes,
  };
}

export function runWatch({root = REPO, now = null} = {}) {
  const ledger = path.join(root, 'atlas4h/ledger');
  const nowMs = now ? Date.parse(now) : Date.now();
  const since = isoKst(nowMs - 3 * 24 * 3600e3).slice(0, 10);
  const loops = readLedger(ledger, 'loops', since);
  const seen = new Set(readLedger(ledger, 'watch', since).map(w => w.loopId));
  const todo = loops.filter(l => !seen.has(l.loopId));
  if (!todo.length) return [];
  const boards = new Map(readLedger(ledger, 'boards', since).map(b => [b.id, b]));
  const seals = new Map(readLedger(ledger, 'seals', since).map(s => [s.boardId, s]));
  const bases = new Map(readLedger(ledger, 'baselines', since).map(b => [b.boardId, b]));
  const removed = removedLedgerLines(root);
  const rows = [];
  for (const l of todo) {
    const board = l.boardId ? boards.get(l.boardId) ?? null : null;
    const row = watchRow(l, {board, seal: board ? seals.get(board.id) : null, baselines: board ? bases.get(board.id) : null, removed, nowIso: isoKst(nowMs)});
    appendLine(path.join(ledger, 'watch', `${isoKst(nowMs).slice(0, 10)}.jsonl`), row);
    rows.push(row);
  }
  return rows;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') o.root = path.resolve(argv[++i]);
    else if (argv[i] === '--now') o.now = argv[++i];
    else {
      console.error(`모르는 칸: ${argv[i]}`);
      process.exit(1);
    }
  }
  const rows = runWatch(o);
  for (const r of rows) console.log(`${r.loopId} · ${r.by} · S1~S8 ${['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].map(k => (typeof r.S[k] === 'number' ? r.S[k] : '?')).join('·')} (? = ${CANNOT})`);
  if (!rows.length) console.log('감시할 새 고리 없음');
}

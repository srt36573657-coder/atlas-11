#!/usr/bin/env node
/**
 * ATLAS 4시간 엔진 0판 · 판 하나를 짓고 봉인해 장부에 덧붙인다 (덧붙이기만 · 고치지 않음)
 *
 *   node atlas4h/engine/run.mjs --slot 16 --asof 2026-10-01 [--ledger DIR] [--input FILE] [--history DIR] [--seed N] [--dry]
 *
 *   --asof    판 날짜(그 시각 판의 한국 날짜). 16·20시 판은 그날 종가가 출발값, 00·04·08시 판은 앞 거래일 종가가 출발값(clock.mjs slotPlan)
 *   --history 지난 자료 폴더(기본 atlas4h/data/history) — kospi.json 이 있으면 코스피 판도 낸다
 *   --ledger  장부 폴더. 안 주면 임시 폴더에 쓴다(진짜 atlas4h/ledger/ 에는 이 단계에서 쓰지 않는다).
 *   --dry     짓기만 하고 쓰지 않는다.
 * 쓰는 곳: DIR/boards/<봉인 날짜>.jsonl · DIR/seals/<봉인 날짜>.jsonl
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildInputs, buildBoard, sealRecord, isoKst} from './board.mjs';
import {slotPlan} from './clock.mjs';
import {loadHistories, fileSha256, HISTORY_DIR} from './history.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function parseArgs(argv) {
  const o = {slot: '16', asof: null, ledger: null, input: path.join(ROOT, 'public/data/input.json'), history: path.join(ROOT, HISTORY_DIR), seed: null, dry: false};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry') o.dry = true;
    else if (a === '--slot') o.slot = String(argv[++i]).padStart(2, '0');
    else if (a === '--asof') o.asof = argv[++i];
    else if (a === '--ledger') o.ledger = argv[++i];
    else if (a === '--input') o.input = argv[++i];
    else if (a === '--history') o.history = argv[++i];
    else if (a === '--seed') o.seed = Number(argv[++i]);
    else throw new Error(`모르는 칸: ${a}`);
  }
  if (!['00', '04', '08', '12', '16', '20'].includes(o.slot)) throw new Error(`slot 은 00·04·08·12·16·20 중 하나: ${o.slot}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.asof ?? '')) throw new Error('--asof YYYY-MM-DD 가 필요하다');
  return o;
}

export function gitState(root = ROOT) {
  try {
    const commit = execFileSync('git', ['-C', root, 'rev-parse', '--short=12', 'HEAD'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim();
    const dirty = execFileSync('git', ['-C', root, 'status', '--porcelain', '--', 'atlas4h/engine'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim() !== '';
    return {commit, dirty};
  } catch {
    return {commit: null, dirty: null};
  }
}

/** 판 하나 짓기 (쓰지 않음) — asof = 판 날짜(한국) · 출발일·목표일은 slotPlan */
export function makeBoard({input, slot, asof, at = isoKst(Date.now()), seed = null, git = gitState(), file = 'public/data/input.json', histories = {}, fileHashes = null}) {
  const sessions = input.calendar.sessions;
  const plan = slotPlan(sessions, slot, asof);
  if (!plan.anchorDate) throw new Error(`${asof} ${slot}시 판의 출발일(거래일)이 없다 (input.json calendar)`);
  if (!plan.target) throw new Error(`${asof} ${slot}시 판의 목표 거래일이 없다 (input.json calendar)`);
  const inputs = buildInputs(input, {asof: plan.anchorDate, at, histories});
  const s = Number.isInteger(seed) ? seed : Number(asof.replaceAll('-', '')) * 100 + Number(slot);
  const files = [file, ...(histories.kospi && !histories.kospi.none && inputs.variables[0].value !== null ? [histories.kospi.file] : [])];
  const board = buildBoard({
    inputs, seed: s, slot, kind: ['08', '16'].includes(slot) ? '무거운' : '가벼운',
    createdAt: at, sealedAt: at, target: plan.target, commit: git.commit, dirty: git.dirty, files, fileHashes, slotDate: asof,
  });
  return {board, seal: sealRecord(board, git.commit), plan};
}

function appendLine(file, obj) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.appendFileSync(file, `${JSON.stringify(obj)}\n`);
}

export function main(argv = process.argv.slice(2)) {
  const o = parseArgs(argv);
  const buf = fs.readFileSync(o.input);
  const input = JSON.parse(buf.toString('utf8'));
  const histories = loadHistories(o.history, ['kospi'], ROOT);
  const file = path.relative(ROOT, path.resolve(o.input)).split(path.sep).join('/');
  const fileHashes = {[file]: fileSha256(buf), ...(histories.kospi.none ? {} : {[histories.kospi.file]: histories.kospi.sha256})};
  const {board, seal} = makeBoard({input, slot: o.slot, asof: o.asof, seed: Number.isInteger(o.seed) ? o.seed : null, histories, file, fileHashes});
  const day = board.sealedAt.slice(0, 10);
  const ok = board.stocks.filter(s => s.center !== null).length;
  const say = `판 ${board.id} · 목표 ${board.target.date} · 종목 ${ok}/${board.stocks.length} · 코스피 ${board.kospi ? '있음' : '없음'} · 지문 ${seal.sha256.slice(0, 12)}`;
  if (o.dry) {
    console.log(`[미리보기 · 쓰지 않음] ${say}`);
    return {board, seal, ledger: null};
  }
  const ledger = o.ledger ?? fs.mkdtempSync(path.join(os.tmpdir(), 'atlas4h-ledger-'));
  appendLine(path.join(ledger, 'boards', `${day}.jsonl`), board);
  appendLine(path.join(ledger, 'seals', `${day}.jsonl`), seal);
  console.log(`${say}\n장부: ${ledger}`);
  return {board, seal, ledger};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (e) {
    console.error(`멈춤: ${e.message}`);
    process.exit(1);
  }
}

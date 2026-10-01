/**
 * 갈래 나(진단) 공통 도구 — 명령서 6판 6·7·14·24절 · 계획 reports/atlas11/overhaul/plan.md
 * 운영 코드는 읽기만 한다(불러다 쓰기만). 결과는 reports/atlas11/overhaul/ 아래에만 쓴다.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const OUT = path.join(ROOT, 'reports/atlas11/overhaul');
export const REP = Object.freeze({'2026-09-29': '2026-09-28-rolling20-13cd892134e517b4', '2026-09-30': '2026-09-29-atlas11-128de9174cfdfa1f'});
export const RETRO_INPUT = Object.freeze({commit: '30dcfb2', path: 'public/data/input.json', sha256: '4b0d7b61d8d36256f481a0db2872b3f145ced764d1afb86da9c48c4c5e554a8e'});
export const PUB_0929 = Object.freeze({commit: '940698c', forecast: 'public/data/atlas11/forecast.json', input: 'public/data/input.json', inputSha256: 'af2699952675d8dc06830953fc8f18c6d4ffb4f2c002608ccb014ac1f297484c', forecastId: '2026-09-29-atlas11-128de9174cfdfa1f'});
export const DELTA = 0.001;
export const BOOT = Object.freeze({blockLength: 20, resamples: 2000, seed: 20260929, blocks: 6, pThreshold: 0.8, minBlocks: 4});

export const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');
export const mean = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN; // lib/factor36.mjs 의 mean 과 같은 식
export const dirOf = (r, delta = DELTA) => r > delta ? 'up' : r < -delta ? 'down' : 'flat';
export const TIE = ['flat', 'up', 'down'];
/** 실전 방향: 가장 높은 확률, 같으면 보합→상승→하락 */
export function pickDirection(p) { let best = null; for (const c of TIE) if (best === null || p[c] > p[best]) best = c; return best; }
export const r2 = x => Math.round(x * 100) / 100;
export const pct = x => x * 100;

export function gitShow(commit, file) { return execFileSync('git', ['show', `${commit}:${file}`], {cwd: ROOT, maxBuffer: 512 << 20}); }
export function gitHead() { return execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {cwd: ROOT, encoding: 'utf8'}).trim(); }
export function readJSON(rel) { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }
export function writeJSON(rel, obj) { const p = path.join(ROOT, rel); fs.mkdirSync(path.dirname(p), {recursive: true}); const text = JSON.stringify(obj, null, 1) + '\n'; fs.writeFileSync(p, text); return sha256(text); }
export function kstNow() { return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 16).replace('T', ' ') + ' KST'; }

/** 운영 입력을 커밋에서 바이트 그대로 읽고 지문을 확인한다 */
export function inputAt(commit, file, want) {
  const bytes = gitShow(commit, file), got = sha256(bytes);
  if (want && got !== want) throw Error(`INPUT_SHA_MISMATCH ${commit}:${file} ${got}`);
  return {input: JSON.parse(bytes), sha256: got, bytes: bytes.length};
}

// ---------------- 기록 장부 · 실전 104칸(3절) ----------------
export function ledgerRecords() {
  const dir = path.join(ROOT, 'reports/atlas11/ledger'), out = [];
  for (const kind of fs.readdirSync(dir).sort()) {
    const sub = path.join(dir, kind); if (!fs.statSync(sub).isDirectory()) continue;
    for (const f of fs.readdirSync(sub).filter(n => n.endsWith('.jsonl')).sort()) {
      const rel = path.relative(ROOT, path.join(sub, f));
      fs.readFileSync(path.join(sub, f), 'utf8').split('\n').forEach((line, i) => { line = line.trim(); if (line) out.push({file: rel, line: i + 1, rec: JSON.parse(line)}); });
    }
  }
  return out;
}
function latestBy(rows) { return rows.sort((a, b) => (a.rec.at ?? '').localeCompare(b.rec.at ?? '') || a.file.localeCompare(b.file) || a.line - b.line).at(-1).rec; }
const PARTS_RE = /기대 누적 ([+\-−]?\d+(?:\.\d+)?)% = 절편 ([+\-−]?\d+(?:\.\d+)?)% \+ 자기 추세 ([+\-−]?\d+(?:\.\d+)?)% \+ 52종목 폭·평균 ([+\-−]?\d+(?:\.\d+)?)%/;

/** 3절 그대로: 정정되지 않은 score · 1거래일 · 대표 발행본 · 같은 칸은 가장 나중 at · 원인 분석 기록도 같은 방법 */
export function liveCells() {
  const all = ledgerRecords(), superseded = new Set(all.map(t => t.rec.supersedes).filter(Boolean));
  const current = all.filter(t => !superseded.has(t.rec.id));
  const key = b => `${b.forecastId}|${b.code}|${b.targetDate}`;
  const scoreRows = new Map(), anRows = new Map();
  for (const t of current) { const b = t.rec.body ?? {}; if (t.rec.type === 'score' && b.horizon === 1 && REP[b.targetDate] === b.forecastId) { const k = key(b); if (!scoreRows.has(k)) scoreRows.set(k, []); scoreRows.get(k).push(t); } }
  for (const t of current) { const b = t.rec.body ?? {}; if (t.rec.type === 'analysis' && b.kind === 'cell' && b.horizon === 1 && scoreRows.has(key(b))) { const k = key(b); if (!anRows.has(k)) anRows.set(k, []); anRows.get(k).push(t); } }
  const cells = [];
  for (const [k, rows] of [...scoreRows.entries()].sort((a, b) => { const [, ca, da] = a[0].split('|'), [, cb, db] = b[0].split('|'); return da.localeCompare(db) || ca.localeCompare(cb); })) {
    const s = latestBy(rows), b = s.body, an = anRows.has(k) ? latestBy(anRows.get(k)) : null;
    const m = an ? PARTS_RE.exec(an.body.modelContribution?.[0] ?? '') : null;
    const zero = !!m && m[2] === '0.00' && m[3] === '0.00' && m[4] === '0.00';
    const p = b.probabilities, sel = pickDirection(p), actRet = b.actual / b.anchor - 1, act = dirOf(actRet), ape = Math.abs(b.predicted.p50 - b.actual) / b.actual;
    cells.push({date: b.targetDate, origin: b.originDate, forecastId: b.forecastId, code: b.code, name: b.name, anchor: b.anchor, actual: b.actual, p50: b.predicted.p50, probabilities: p, predStored: b.predictedDirection, pred: sel, act, actRet, dirOk: sel === act, ape, sizeOk: ape <= 0.015, baseApe: Math.abs(b.anchor - b.actual) / b.actual, zero, parts: m ? m.slice(1, 5) : null, scoreId: s.id, analysisId: an?.id ?? null});
  }
  return cells;
}

// ---------------- 블록 부트스트랩(방향 맞음률 · 높을수록 좋음) ----------------
/** cand·ref: 기준일 순서의 값 배열. 난수식·뽑는 순서는 lib/atlas11/evolve/backtest.mjs:83-94 와 같다. */
export function bootstrapCompare(cand, ref, {blockLength = BOOT.blockLength, resamples = BOOT.resamples, seed = BOOT.seed, blocks = BOOT.blocks} = {}) {
  if (cand.length !== ref.length || !cand.length || cand.some(x => !Number.isFinite(x)) || ref.some(x => !Number.isFinite(x))) throw Error('BOOT_INPUT');
  const diff = cand.map((c, k) => c - ref[k]), nb = Math.ceil(diff.length / blockLength);
  let s = seed >>> 0; const rnd = () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 4294967296; };
  let up = 0, down = 0; const means = [];
  for (let r = 0; r < resamples; r++) {
    const picked = []; for (let b = 0; b < nb; b++) { const start = Math.floor(rnd() * nb) * blockLength; for (let j = start; j < Math.min(start + blockLength, diff.length); j++) picked.push(diff[j]); }
    const m = mean(picked); means.push(m); if (m > 0) up++; else if (m < 0) down++;
  }
  means.sort((a, b) => a - b);
  const size = Math.ceil(cand.length / blocks), blockMeans = Array.from({length: blocks}, (_, b) => ({cand: mean(cand.slice(b * size, (b + 1) * size)), ref: mean(ref.slice(b * size, (b + 1) * size))}));
  const blocksCand = blockMeans.filter(x => x.cand > x.ref).length, blocksRef = blockMeans.filter(x => x.ref > x.cand).length;
  const pCand = up / resamples, pRef = down / resamples;
  const candBetter = pCand >= BOOT.pThreshold && blocksCand >= BOOT.minBlocks, refBetter = pRef >= BOOT.pThreshold && blocksRef >= BOOT.minBlocks;
  return {method: 'block_bootstrap_over_origin_days', blockLength, resamples, seed, origins: cand.length, meanCand: mean(cand), meanRef: mean(ref), meanDifference: mean(diff), pCandBetter: pCand, pRefBetter: pRef, ci90: [means[Math.floor(resamples * 0.05)], means[Math.floor(resamples * 0.95)]], blocksCandBetter: blocksCand, blocksRefBetter: blocksRef, blockMeans, candBetter, refBetter, outcome: candBetter ? 'cand_better' : refBetter ? 'ref_better' : 'not_separated'};
}

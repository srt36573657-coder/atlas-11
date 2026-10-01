#!/usr/bin/env node
/**
 * ATLAS 11 대개선 검사기 · 명령서 6판(reports/atlas11/overhaul/prompt-v6.md)
 *   node scripts/atlas11/overhaul/check.mjs --rules          설계 규칙 D1~D8
 *   node scripts/atlas11/overhaul/check.mjs --step W1        작업별 시험(W1 = T0) · W3 이후는 checks/W*.mjs
 *   node scripts/atlas11/overhaul/check.mjs --inject T0|D1|D5|all   일부러 결함을 심어 검사가 막는지 본다(막으면 통과)
 * 결과는 한 줄씩 JSON으로 찍고, 하나라도 실패면 종료 코드 1. 원본 파일은 바꾸지 않는다(결함은 사본·메모리에만).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const BASE = '45dbca0';
export const PROMPT = 'reports/atlas11/overhaul/prompt-v6.md';
export const PROGRESS = 'reports/atlas11/overhaul/progress.json';
const LOCK = {
  D1: ['config/atlas11/scoring-policy.v1.json', '395c9821305b8226a6958855ef8efb9257a46bcaf938fc0ba85c80126311e746'],
  D2: ['config/atlas11/evolution.v1.json', '0fdb0105174880ae9f7eda06c4f70410507085553e51aba5ae437ceb95ddd340'],
  D3: ['.github/workflows/atlas11-daily.yml', '4f1bad5ce85973fd794a826bb062de5e6bbc94d7f64040e41295dee93a4a5f0c'],
};
export const SECRET = /ghp_[A-Za-z0-9]{30,}|gh[ousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|nfp_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/;

export const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');
export const rel = p => path.join(ROOT, p);
const git = args => execFileSync('git', args, {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20});
const out = [];
export function report(id, pass, detail = {}) { const row = {id, pass: !!pass, ...detail}; out.push(row); console.log(JSON.stringify(row)); return row; }

// grep "cron:" file | sha256sum 과 같은 값: cron: 이 든 줄을 줄바꿈과 함께 이어 붙인 바이트
export function cronLinesHash(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.includes('cron:'));
  return sha(lines.map(l => l + '\n').join(''));
}
export function changedFiles() {
  const tracked = git(['diff', '--name-only', BASE]).split('\n').filter(Boolean);
  const untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n').filter(Boolean);
  return [...new Set([...tracked, ...untracked])].filter(f => fs.existsSync(rel(f)));
}
export function secretHits(files, root = ROOT) {
  const hits = [];
  for (const f of files) {
    const p = path.isAbsolute(f) ? f : path.join(root, f);
    const st = fs.statSync(p); if (!st.isFile() || st.size > 8 << 20) continue;
    const text = fs.readFileSync(p, 'utf8'); if (text.includes('\u0000')) continue;
    const m = SECRET.exec(text); if (m) hits.push({file: f, at: m.index});
  }
  return hits;
}
export function flat(o, p = '') {
  if (Array.isArray(o)) return o.flatMap((v, i) => flat(v, `${p}[${i}]`));
  if (o && typeof o === 'object') return Object.entries(o).flatMap(([k, v]) => flat(v, p ? `${p}.${k}` : k));
  return [[p, o]];
}
// 7절 공차: 정수는 정확히 · 소수는 둘째 자리 반올림 값 · 글자는 그대로
export function sameValue(a, b) {
  if (typeof a === 'string' || typeof b === 'string') return a === b;
  if (Number.isInteger(a) && Number.isInteger(b)) return a === b;
  return Math.round(a * 100) === Math.round(b * 100);
}
export function compareTable(expected, actual) {
  const e = new Map(flat(expected)), a = new Map(flat(actual));
  const keys = [...e.keys()], diff = [];
  for (const k of keys) if (!a.has(k) || !sameValue(e.get(k), a.get(k))) diff.push({key: k, expected: e.get(k), actual: a.get(k)});
  const extra = [...a.keys()].filter(k => !e.has(k));
  return {same: keys.length - diff.length, total: keys.length, diff, extra};
}
export function promptAnswerHash() {
  const m = /그 파일 sha256: ([0-9a-f]{64})/.exec(fs.readFileSync(rel(PROMPT), 'utf8'));
  return m ? m[1] : null;
}

// ---------- 설계 규칙 D1~D8 ----------
export function checkRules() {
  for (const id of ['D1', 'D2']) { const [f, want] = LOCK[id]; const got = sha(fs.readFileSync(rel(f))); report(id, got === want, {file: f, sha256: got}); }
  { const [f, want] = LOCK.D3; const got = cronLinesHash(rel(f)); report('D3', got === want, {file: f, cronLinesSha256: got}); }
  { const rows = git(['diff', '--numstat', BASE, '--', 'reports/atlas11/ledger']).split('\n').filter(Boolean).map(l => l.split('\t'));
    const deleted = rows.reduce((s, r) => s + (Number(r[1]) || 0), 0), added = rows.reduce((s, r) => s + (Number(r[0]) || 0), 0);
    report('D4', deleted === 0, {base: BASE, ledgerDeletedLines: deleted, ledgerAddedLines: added}); }
  { const files = changedFiles(), hits = secretHits(files); report('D5', hits.length === 0, {scannedFiles: files.length, hits}); }
  { const ev = JSON.parse(fs.readFileSync(rel(LOCK.D2[0]), 'utf8')); report('D6', ev.schedule?.publishEnd === '2026-10-30', {publishEnd: ev.schedule?.publishEnd}); }
  { const code = changedFiles().filter(f => /\.(mjs|js|cjs|py|sh|ya?ml)$/.test(f) && !f.endsWith('overhaul/check.mjs'));
    const hits = code.filter(f => /actions\/workflows\/[^\s'"`]*\/dispatches/.test(fs.readFileSync(rel(f), 'utf8')));
    report('D7', hits.length === 0, {scannedCodeFiles: code.length, dispatchCalls: hits}); }
  { let want = null; try { want = JSON.parse(fs.readFileSync(rel(PROGRESS), 'utf8')).prompt?.sha256; } catch {}
    const got = sha(fs.readFileSync(rel(PROMPT))); report('D8', !!want && got === want, {prompt: PROMPT, sha256: got, progress: want}); }
}

// ---------- W1 · T0 ----------
export function latestRecount() {
  const dir = rel('reports/atlas11/overhaul');
  const names = fs.readdirSync(dir).filter(n => /^recount-\d+\.json$/.test(n)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  return names.length ? path.join(dir, names.at(-1)) : null;
}
export function checkT0({expectedOverride = null} = {}) {
  const buf = fs.readFileSync(rel('reports/atlas11/overhaul/expected.json'));
  const hashOk = sha(buf) === promptAnswerHash();
  const expected = expectedOverride ?? JSON.parse(buf.toString('utf8'));
  const rc = latestRecount(); const actual = JSON.parse(fs.readFileSync(rc, 'utf8'));
  const c = compareTable(expected, actual);
  return report('T0', hashOk && c.same === c.total && c.extra.length === 0, {expectedSha256Ok: hashOk, recount: path.relative(ROOT, rc), same: `${c.same}/${c.total}`, diff: c.diff});
}

// ---------- 결함 심기 ----------
export function inject(which) {
  const keep = {[LOCK.D1[0]]: sha(fs.readFileSync(rel(LOCK.D1[0]))), 'reports/atlas11/overhaul/expected.json': sha(fs.readFileSync(rel('reports/atlas11/overhaul/expected.json')))};
  const runs = which === 'all' ? ['T0', 'D1', 'D5'] : [which];
  for (const w of runs) {
    if (w === 'T0') {
      const bad = JSON.parse(fs.readFileSync(rel('reports/atlas11/overhaul/expected.json'), 'utf8')); bad['칸'] += 1;
      const quiet = console.log; console.log = () => {}; const r = checkT0({expectedOverride: bad}); console.log = quiet; out.pop();
      report('inject:T0', r.pass === false, {planted: '정답표 사본의 칸 104→105', caught: r.pass === false});
    } else if (w === 'D1') {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ovh-')), copy = path.join(tmp, 'scoring-policy.v1.json');
      const text = fs.readFileSync(rel(LOCK.D1[0]), 'utf8'); fs.writeFileSync(copy, text.replace('"v1"', '"v2"'));
      const caught = sha(fs.readFileSync(copy)) !== LOCK.D1[1]; fs.rmSync(tmp, {recursive: true});
      report('inject:D1', caught, {planted: '채점 규칙 사본의 한 글자 바꿈', caught});
    } else if (w === 'D5') {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ovh-')), f = path.join(tmp, 'leak.txt');
      fs.writeFileSync(f, 'token=ghp_' + 'A1b2C3d4'.repeat(5) + '\n'); const hits = secretHits([f], '/'); fs.rmSync(tmp, {recursive: true});
      report('inject:D5', hits.length === 1, {planted: '사본에 가짜 ghp_ 무늬', caught: hits.length === 1});
    }
  }
  for (const [f, h] of Object.entries(keep)) report('inject:원본그대로', sha(fs.readFileSync(rel(f))) === h, {file: f});
}

// ---------- 작업별 시험(W3 이후는 갈래마다 checks/W*.mjs) ----------
async function step(w) {
  if (w === 'W1') return checkT0();
  const mod = path.join(ROOT, 'scripts/atlas11/overhaul/checks', `${w}.mjs`);
  if (!fs.existsSync(mod)) return report(w, false, {error: '이 작업의 시험이 아직 없다(checks/' + w + '.mjs)'});
  const m = await import(pathToFileURL(mod).href);
  return m.default({report, sha, rel, ROOT, compareTable, flat});
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), val = k => { const i = a.indexOf(k); return i < 0 ? null : a[i + 1]; };
  if (a.includes('--rules')) checkRules();
  if (val('--step')) await step(val('--step'));
  if (val('--inject')) inject(val('--inject'));
  if (!out.length) { console.error('쓰는 법: --rules | --step W1 | --inject T0|D1|D5|all'); process.exit(2); }
  const failed = out.filter(r => !r.pass);
  console.log(JSON.stringify({summary: true, checks: out.length, failed: failed.map(r => r.id)}));
  process.exit(failed.length ? 1 : 0);
}

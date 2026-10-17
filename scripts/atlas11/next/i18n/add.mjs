#!/usr/bin/env node
// 영어 한 줄 더하기(사장님 2026-10-18 00:35 「더 효율적인 방식 … 더 빠르개 더 정확하개」 · brief4 빠른 길 5)
//   새 한국어 글을 넣은 일꾼이 그 자리에서 en-src.json 에 영어를 더함 — 넘겨주기 기다림 0 · 여럿이 동시에 불러도 잠금으로 한 줄씩
//   쓰는 법: node scripts/atlas11/next/i18n/add.mjs "<한국어 틀>" "<영어>" [더 많은 짝 …]   ({n} 숫자 · {d} 날짜 · {e} 이름 — 엔진이 보는 그대로)
//            node scripts/atlas11/next/i18n/add.mjs --file 짝.json   ([["한국어","영어"], …])
//   이미 같은 한국어가 있고 영어가 다르면 바꾸지 않고 알림(끝 코드 2) — 바꾸려면 --force · en.json 은 통합이 i18n_build.mjs 로 한 번에 만듦
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), 'en-src.json');
const LOCK = SRC + '.lock';
const argv = process.argv.slice(2), force = argv.includes('--force');
let pairs = [];
const fi = argv.indexOf('--file');
if (fi >= 0) pairs = JSON.parse(fs.readFileSync(argv[fi + 1], 'utf8'));
else { const xs = argv.filter(a => a !== '--force'); for (let i = 0; i + 1 < xs.length; i += 2) pairs.push([xs[i], xs[i + 1]]); }
if (!pairs.length || pairs.some(p => !Array.isArray(p) || typeof p[0] !== 'string' || typeof p[1] !== 'string' || !p[0].trim() || !p[1].trim())) {
  console.error('쓰는 법: add.mjs "<한국어 틀>" "<영어>" … 또는 --file 짝.json'); process.exit(1);
}
if (pairs.some(([, en]) => /[가-힣]/.test(en))) { console.error('영어 칸에 한글이 있음 — 영어만 적어 주세요'); process.exit(1); }
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
let got = false;
for (let i = 0; i < 400 && !got; i++) { try { fs.mkdirSync(LOCK); got = true; } catch { const st = (() => { try { return fs.statSync(LOCK); } catch { return null; } })(); if (st && Date.now() - st.mtimeMs > 30e3) { try { fs.rmdirSync(LOCK); } catch { /* 다른 이가 지움 */ } } sleep(50); } }
if (!got) { console.error('잠금을 못 얻음(20초) — 잠시 뒤 다시'); process.exit(3); }
let added = 0, same = 0, clash = [];
try {
  const raw = fs.readFileSync(SRC, 'utf8'), d = JSON.parse(raw), T = d.templates;
  for (const [ko, en] of pairs) {
    if (!(ko in T)) { T[ko] = en; added++; }
    else if (T[ko] === en) same++;
    else if (force) { T[ko] = en; added++; }
    else clash.push([ko, T[ko], en]);
  }
  if (added) { const tmp = SRC + '.tmp' + process.pid; fs.writeFileSync(tmp, JSON.stringify(d, null, 1) + '\n'); fs.renameSync(tmp, SRC); }
} finally { fs.rmdirSync(LOCK); }
console.log(`더함 ${added} · 이미 같음 ${same} · 다름 ${clash.length}`);
for (const [ko, old, en] of clash) console.log(`  다름: 「${ko}」 지금 "${old}" · 새 "${en}" (바꾸려면 --force)`);
process.exit(clash.length ? 2 : 0);

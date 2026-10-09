// 백만 번 맞대기(scripts/atlas11/verify/million.mjs)를 단위 시험마다 작게 — 사장님 2026-10-09 19:25 「오류 있느지 1000000번 점 검하고」
//   섬 셈(site/app/island-model.js)과 고르는 셈(lib/atlas11/cand.mjs)의 약속을 무작위 판(씨앗 고정)에서 따로 셈해 맞댐 — 실패 0 · 고르는 판 60개(한국 · 미국 반씩)
//   전체(1,000,000번)는 node scripts/atlas11/verify/million.mjs → reports/atlas11/verify/million-latest.json
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const run = promisify(execFile);

test('맞대기 4만 번 + 3단 클릭 — 섬 · 고르는 셈 · 누름 셈 약속 실패 0(한국 · 미국 판 · 미국 위험 공시 = 「확인 못 함」)', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'million-')), out = path.join(dir, 'm.json');
  const {stdout} = await run(process.execPath, ['scripts/atlas11/verify/million.mjs', '--target', '40000', '--out', out], {cwd: path.resolve(import.meta.dirname, '../..'), maxBuffer: 1e7});
  const r = JSON.parse(await fs.readFile(out, 'utf8')), line = JSON.parse(stdout.trim().split('\n').at(-1));
  assert.equal(r.failed, 0, JSON.stringify(r.fails?.slice(0, 3)));
  assert.equal(line.failed, 0);
  assert.ok(r.checks >= 40000, `맞댄 수 ${r.checks}`);
  assert.equal(r.boards.cand, 60);
  for (const k of ['섬 · 물 위 ⇔ 그물 안', '섬 · 높이 차례 = 1년 추세 차례', '고름 · 7곳 = 따로 고른 7곳(차례까지)', '고름 · 미국 판 위험 공시 = 확인 못 함']) assert.ok(r.perKind[k] > 0, `약속 「${k}」을 맞대지 않음`);
  for (const k of ['3단 · 탑을 누르면 그 회사', '3단 · 그 업종 = 같은 g 의 회사 모두', '3단 · 같은 탑을 다시 누르면 닫힘', '3단 · 다른 탑을 누르면 그 탑 · 그 업종']) assert.ok(r.perKind[k] > 0, `3단 클릭 약속 「${k}」을 맞대지 않음`); // 2026-10-09 21:33 「3단 클릭구조 … 점검」
  if (r.real.length) assert.ok(r.perKind['3단 · 지도 섬 처음 모습에서 업종마다 누를 수 있는 탑(가린 업종 0)'] > 0, '사이트 묶음이 있는데 지도 섬 자리 셈을 맞대지 않음');
  await fs.rm(dir, {recursive: true, force: true});
});

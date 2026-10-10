// 백만 번 맞대기(scripts/atlas11/verify/million.mjs)를 단위 시험마다 작게 — 사장님 2026-10-09 19:25 「오류 있느지 1000000번 점 검하고」
//   첫 화면 막대 그래프 셈(site/app/candbars.js — 2026-10-10 11:19 「바둑판 영구 삭제해」로 365칸 바둑판 셈을 바꿈)과 고르는 셈(lib/atlas11/cand.mjs)의 약속을 무작위 판(씨앗 고정)에서 따로 셈해 맞댐 — 실패 0 · 고르는 판 60개(한국 · 미국 반씩)
//   전체(1,000,000번)는 node scripts/atlas11/verify/million.mjs → reports/atlas11/verify/million-latest.json
import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const run = promisify(execFile);

test('맞대기 4만 번 — 막대 그래프 · 고르는 셈 약속 실패 0(한국 · 미국 판 · 미국 위험 공시 = 「확인 못 함」) · 실제 판 막대 줄 = 판의 회사(3단 클릭)', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'million-')), out = path.join(dir, 'm.json');
  const {stdout} = await run(process.execPath, ['scripts/atlas11/verify/million.mjs', '--target', '40000', '--out', out], {cwd: path.resolve(import.meta.dirname, '../..'), maxBuffer: 1e7});
  const r = JSON.parse(await fs.readFile(out, 'utf8')), line = JSON.parse(stdout.trim().split('\n').at(-1));
  assert.equal(r.failed, 0, JSON.stringify(r.fails?.slice(0, 3)));
  assert.equal(line.failed, 0);
  assert.ok(r.checks >= 40000, `맞댄 수 ${r.checks}`);
  assert.equal(r.boards.cand, 60); assert.ok(r.boards.bars > 0);
  for (const k of ['막대 · 줄 차례 = 순위 차례', '막대 · 1년 추세 % = 판 읽기 값(소수 첫째)', '막대 · 20거래일 전 % = 판 읽기 값(소수 첫째)', '막대 · 같은 축(따로 셈)', '막대 · 막대 = 0 에서 값까지(오름 오른쪽 · 내림 왼쪽 · 짧으면 0.6%)', '막대 · 값이 없으면 막대 없음',
    '막대 · 큰 값이 오른쪽(값 차례 = 자리 차례)', '막대 · 그물 안 곳 수(flags 다섯째 · 값 있음)', '막대 · 기준 셋을 넘은 곳 수(앞 셋 111)', '고름 · 7곳 = 따로 고른 7곳(차례까지)', '고름 · 미국 판 위험 공시 = 확인 못 함']) assert.ok(r.perKind[k] > 0, `약속 「${k}」을 맞대지 않음`);
  for (const k of Object.keys(r.perKind)) assert.ok(!/^칸 ·|칸을 누르면|가린 칸/.test(k), `옛 바둑판 약속 「${k}」이 남음`); // 2026-10-10 11:19 「바둑판 영구 삭제해」
  if (r.real.length) { assert.ok(r.perKind['3단 · 막대 줄 = 판의 회사(줄 → 카드 → 회사 화면)'] >= r.real.length, '사이트 묶음이 있는데 실제 판 막대 줄을 맞대지 않음'); for (const p of r.real) assert.ok(r.click3[p] >= 1, `실제 ${p} 판 막대 줄 0`); }
  await fs.rm(dir, {recursive: true, force: true});
});

// 매일 실행기 → 종가 수집기에 이어 붙인 거래일 달력(rolling-calendar)을 넘김(주문 0556 · 2026-11-03 전체 점검)
//   11월 2일 · 3일 한국 종가 수집이 「오늘 종가 0 · partial」 — 실행기는 rolling-calendar 로 날을 셌지만 수집기에는 달력을 안 넘겨
//   수집기가 input.calendar(거래일이 10월 30일에서 멈춤)로 받을 날을 셈함 → 11월 거래일을 받을 날로 보지 않음
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {runDaily} from '../../lib/atlas11/daily.mjs';
import {tempRoot, root, INPUT_928} from './helpers.mjs';

test('수집기는 실행기가 날을 센 달력(rolling-calendar)을 받음 — input.calendar 가 멈춰 있어도 그 뒤 거래일을 받을 날로 셈', async () => {
  const dir = await tempRoot();
  for (const [src, dst] of [[INPUT_928, 'public/data/input.json'], ['public/data/rolling-calendar.json', 'public/data/rolling-calendar.json']]) {
    await fs.mkdir(path.dirname(path.join(dir, dst)), {recursive: true}); await fs.copyFile(path.join(root, src), path.join(dir, dst));
  }
  const rolling = JSON.parse(await fs.readFile(path.join(root, 'public/data/rolling-calendar.json'), 'utf8'));
  const input = JSON.parse(await fs.readFile(path.join(dir, 'public/data/input.json'), 'utf8'));
  const seen = [];
  const collector = async (inp, window, opts = {}) => { seen.push({window, opts}); return {attempted: true, provider: 'test', observations: [], errors: []}; };
  await runDaily({now: '2026-09-29T07:05:00.000Z', rootDir: dir, collector, buildView: async () => ({boardId: 'b', files: 0})});
  assert.ok(seen.length >= 1, '수집기를 불렀음');
  const cal = seen[0].opts.calendar;
  assert.ok(cal && Array.isArray(cal.sessions), '달력을 넘김');
  assert.deepEqual(cal.sessions.at(-1), rolling.sessions.at(-1), '넘긴 달력 = rolling-calendar(마지막 거래일까지)');
  assert.ok(cal.sessions.length >= (input.calendar?.sessions?.length ?? 0), 'input.calendar 보다 짧지 않음');
});

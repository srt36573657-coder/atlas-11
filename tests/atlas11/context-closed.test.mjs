// 휴장일 손 수집(--closed-day last-session) — 2026-10-04(일) 밤 사장님이 atlas11-context 를 눌렀으나 휴장일이라 아무것도 안 모였던 일
// 기본(매일 실행)은 그대로 휴장일에 아무것도 쓰지 않는다 · 옵션을 주면 바로 앞 거래일을 기준일로 · 그날 수급은 보고값(잠정 아님)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {root, INPUT_928, tempRoot} from './helpers.mjs';
import {collectContext} from '../../scripts/atlas11/collect_context.mjs';

const FX = path.join(root, 'tests/atlas11/fixtures/context');
async function setupRoot() {
  const dir = await tempRoot();
  await fs.mkdir(path.join(dir, 'public/data'), {recursive: true});
  await fs.copyFile(path.join(root, INPUT_928), path.join(dir, 'public/data/input.json'));
  await fs.copyFile(path.join(root, 'public/data/rolling-calendar.json'), path.join(dir, 'public/data/rolling-calendar.json'));
  return dir;
}

test('휴장일(10/5 월 · 개천절 대체공휴일): 옵션 없으면 아무것도 안 씀 · last-session 이면 10/2 기준으로 모으고 받은 시각은 실제 시각', async () => {
  const d1 = await setupRoot();
  const none = await collectContext({now: '2026-10-05T07:05:00.000Z', rootDir: d1, fixtures: FX, codes: ['005930']});
  assert.equal(none.status, 'not_trading_day'); await assert.rejects(fs.readdir(path.join(d1, 'reports/atlas11/context')));
  const d2 = await setupRoot();
  const out = await collectContext({now: '2026-10-05T07:05:00.000Z', rootDir: d2, fixtures: FX, codes: ['005930'], closedDay: 'last-session'});
  assert.notEqual(out.status, 'not_trading_day'); assert.equal(out.day, '2026-10-02'); assert.deepEqual(out.closedDayRun, {actualDay: '2026-10-05', effectiveDay: '2026-10-02'}); assert.equal(out.afterClose, true);
  const latest = JSON.parse(await fs.readFile(path.join(d2, 'reports/atlas11/context/latest.json'), 'utf8'));
  assert.equal(latest.day, '2026-10-02'); assert.equal(latest.fetchedAt, '2026-10-05T07:05:00.000Z'); assert.match(latest.file, /context\/2026-10-02\//);
  const ctx = JSON.parse(await fs.readFile(path.join(d2, latest.file), 'utf8'));
  assert.equal(ctx.flows.length, 1); assert.ok(ctx.flows[0].rows.length > 0);
  assert.ok(ctx.flows[0].rows.every(r => r.status === 'reported'), '휴장일에 받은 앞 거래일 수급은 잠정이 아니다');
  assert.ok(ctx.flows[0].rows.every(r => r.date <= '2026-10-02'));
  assert.equal(ctx.usedInForecast, false);
  // 거래일에는 옵션이 있어도 그날 그대로(9/30 16:05 KST)
  const d3 = await setupRoot();
  const tr = await collectContext({now: '2026-09-30T07:05:00.000Z', rootDir: d3, fixtures: FX, codes: ['005930'], closedDay: 'last-session'});
  assert.equal(tr.day, '2026-09-30'); assert.equal(tr.closedDayRun, undefined);
});

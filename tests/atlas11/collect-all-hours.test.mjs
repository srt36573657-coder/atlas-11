// 전 종목 모으기(collect_universe --all)는 장이 열린 때 받지 않음 — 2026-10-14 틀림 장부 24번(서울 09:44 ~ 09:57 에 받아 그날 끝나지 않은 일봉 · 값이 섞인 일)
//   · 25번(끝을 정규장 15:30 으로 잘못 봄 — 네이버 일봉 종가는 넥스트레이드 저녁 장 20:00 까지 바뀜)
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {marketOpenKst} from '../../scripts/atlas11/collect_universe.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

test('장이 열린 때 — 서울 평일 08:00 ~ 20:00', () => {
  const at = kst => marketOpenKst(new Date(Date.parse(kst + '+09:00')).toISOString());
  assert.equal(at('2026-10-14T09:44:00'), true, '수요일 09:44 = 장 중(그날 받은 때)');
  assert.equal(at('2026-10-14T08:00:00'), true, '08:00 넥스트레이드 아침 장');
  assert.equal(at('2026-10-14T07:59:00'), false);
  assert.equal(at('2026-10-14T15:45:00'), true, '15:45 = 정규장은 끝났지만 시간외 · 넥스트레이드 저녁 장(틀림 장부 25번)');
  assert.equal(at('2026-10-14T19:59:00'), true);
  assert.equal(at('2026-10-14T20:00:00'), false, '20:00 부터 받음');
  assert.equal(at('2026-10-14T20:30:00'), false);
  assert.equal(at('2026-10-10T11:00:00'), false, '토요일(10월 10일 모음)');
  assert.equal(at('2026-10-11T11:00:00'), false, '일요일');
});

test('장 중에 --all 을 부르면 받지 않고 4 로 끝남(아무 파일도 쓰지 않음)', () => {
  const r = spawnSync('node', ['scripts/atlas11/collect_universe.mjs', '--all', '--now', '2026-10-14T00:44:00Z', '--out-dir', 'reports/atlas11/universe/__never__'], {cwd: ROOT, encoding: 'utf8', timeout: 20000});
  assert.equal(r.status, 4, r.stderr); assert.match(r.stderr, /장이 열린 때\(서울 09:44\)/);
});

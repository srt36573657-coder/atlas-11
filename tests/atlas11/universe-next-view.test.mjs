// 바뀔 52곳 미리 보기(첫 화면 맨 위) — 2026-10-04 07:40 사장님 「aaa7377에 올려」
// 실제 설정(config/atlas11/universe.json) · 실제 새 입력(reports/atlas11/universe/2026-10-04-v2/next-input.json) · 9/28 실제 입력 사본으로 본다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {universeNextOf, buildViewBundle, validateViewBundle} from '../../lib/atlas11/view.mjs';
import {readAllPublications} from '../../lib/atlas11/forecast.mjs';
import {realInputs, readJSON, root} from './helpers.mjs';

const TOMORROW = {futureDays: 1, tomorrowOnly: true, since: '2026-10-02', file: 'config/atlas11/horizon.json', configSHA256: null, config: null};
const load = async () => ({config: await readJSON('config/atlas11/universe.json'), nextInput: await readJSON('reports/atlas11/universe/2026-10-04-v2/next-input.json'), ...(await realInputs())});

test('미리 보기: 바꾸기 전에만 · 바꾸는 날 마감 전이면 그날부터 · 마감 뒤(못 바꾼 날)면 다음 거래일로 밀림 · 52곳 순서·새로 들어온 수·빠지는 수', async () => {
  const {config, nextInput, input, calendar} = await load(), sessions = calendar.sessions;
  const at = now => universeNextOf({config, nextInput, input, sessions, now});
  const a = at('2026-10-03T23:10:00.000Z'); // 10/4(일) 08:10 KST
  assert.equal(a.id, config.next.id); assert.equal(a.label, '튼튼한 회사 52곳'); assert.equal(a.switchOn, '2026-10-06');
  assert.equal(a.from, '2026-10-06', '10/5 는 대체 휴장일 · 첫 거래일은 10/6'); assert.equal(a.firstTarget, '2026-10-07');
  assert.deepEqual(a.companies.map(c => c.code), nextInput.assets.map(x => x.code), '새 입력 순서 그대로(시가총액 큰 순 · 업종 4곳까지)');
  const old = new Set(input.assets.map(x => x.code));
  assert.equal(a.added, nextInput.assets.filter(x => !old.has(x.code)).length); assert.equal(a.kept + a.added, 52);
  assert.equal(a.dropped.length, input.assets.filter(x => !nextInput.assets.some(y => y.code === x.code)).length);
  assert.equal(a.now, '업종 대표 52종목'); assert.ok(a.how.length >= 3);
  assert.equal(at('2026-10-06T06:00:00.000Z').from, '2026-10-06', '10/6 15:00 KST — 아직 마감 전');
  const late = at('2026-10-06T07:40:00.000Z'); // 10/6 16:40 KST — 그날 실행에서 못 바꿨다면
  assert.equal(late.from, '2026-10-07'); assert.equal(late.firstTarget, '2026-10-08');
  // 이미 바꿨으면 없음 · 설정에 바꿀 묶음이 없어도 없음 · 새 입력 묶음 이름이 설정과 다르면 없음
  assert.equal(universeNextOf({config, nextInput, input: {...nextInput}, sessions, now: '2026-10-06T08:00:00.000Z'}), null);
  assert.equal(universeNextOf({config: {...config, next: null}, nextInput, input, sessions}), null);
  assert.equal(universeNextOf({config, nextInput: {...nextInput, universe: {...nextInput.universe, id: 'other'}}, input, sessions}), null);
});

test('미리 보기 날짜(바꾸는 날 · 첫 예측 날 · 그 목표일)는 거래일 일정이라 「내일만」 묶음 검사를 통과 · 같은 칸 밖에 넣은 뒤 날짜는 여전히 실패', async () => {
  const {config, nextInput, input, calendar} = await load();
  const p = await readJSON('reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json'), publications = await readAllPublications(root);
  const now = '2026-10-03T23:10:00.000Z', universeNext = universeNextOf({config, nextInput, input, sessions: calendar.sessions, now});
  const files = buildViewBundle({publication: p, input, calendar, publications, horizon: TOMORROW, universeNext, now});
  const m = files.get('manifest.json');
  assert.equal(m.universeNext.from, '2026-10-06'); assert.equal(m.universeNext.companies.length, 52);
  assert.equal(validateViewBundle(files, p), true);
  const leak = new Map(files), m2 = structuredClone(m); m2.universeNext.note = '2026-10-08 전망'; leak.set('manifest.json', m2);
  assert.throws(() => validateViewBundle(leak, p), /VIEW_TOMORROW_DATES_AFTER/);
  // 미리 보기가 없으면 manifest 에 칸이 생기지 않는다(예전 모양 그대로)
  assert.ok(!('universeNext' in buildViewBundle({publication: p, input, calendar, publications, horizon: TOMORROW, now}).get('manifest.json')));
});

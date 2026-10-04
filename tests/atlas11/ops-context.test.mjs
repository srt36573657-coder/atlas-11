import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {runDaily, offlineCollector, runtimeInfo} from '../../lib/atlas11/daily.mjs';
import {readRecords, currentRecords} from '../../lib/atlas11/records.mjs';
import {resolveSite, stageDir} from '../../scripts/atlas11/deploy_netlify.mjs';
import {tempRoot, root, INPUT_928} from './helpers.mjs';

async function fixtureRoot() {
  const dir = await tempRoot();
  await fs.mkdir(path.join(dir, 'public/data'), {recursive: true});
  await fs.copyFile(path.join(root, INPUT_928), path.join(dir, 'public/data/input.json'));
  await fs.copyFile(path.join(root, 'public/data/rolling-calendar.json'), path.join(dir, 'public/data/rolling-calendar.json'));
  return {dir};
}

test('실행 환경 증거: GitHub 러너 변수 → 서버·실행 주소 · 예약 실행은 schedule 이벤트일 때만 · 로컬은 수동', () => {
  const gh = runtimeInfo({GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'schedule', GITHUB_REPOSITORY: 'o/r', GITHUB_RUN_ID: '42', GITHUB_SHA: 'abc', RUNNER_OS: 'Linux'});
  assert.equal(gh.host, 'github-actions'); assert.equal(gh.scheduledRun, true); assert.equal(gh.serverInstalled, true); assert.equal(gh.runUrl, 'https://github.com/o/r/actions/runs/42');
  assert.equal(runtimeInfo({GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch'}).scheduledRun, false, '손으로 누른 실행은 예약 실행이 아니다');
  const local = runtimeInfo({}); assert.equal(local.host, 'local'); assert.equal(local.scheduledRun, false); assert.equal(local.serverInstalled, false);
});

test('매일 실행(예측 없음 · 2026-10-04 15:37): 운영 기록에 예약 실행 증거가 남고 · 예측·채점·분석·요인·실험·모델 기록은 새로 쓰지 않는다 · 화면 묶음 단계는 부른다', async () => {
  const {dir} = await fixtureRoot();
  const env = {GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'schedule', GITHUB_REPOSITORY: 'o/r', GITHUB_RUN_ID: '7'};
  let viewCalls = 0;
  const r = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: dir, collector: offlineCollector, buildView: async () => { viewCalls++; return {boardId: 'b', files: 3}; }, env});
  assert.equal(r.runtime.host, 'github-actions'); assert.equal(r.scheduledRunInstalled, true); assert.equal(r.prediction, 'off'); assert.equal(viewCalls, 1);
  assert.ok(!('forecastId' in r) && !('scoredDates' in r) && !('newForecast' in r), '예측·채점 칸이 없다');
  assert.deepEqual(r.steps.map(s => s.step), ['1_calendar', '2_collect', '3_validate_store', '5_record_view']);
  assert.equal(r.exitCode, 2, '수집기가 없으면(오프라인) 거래일 마감 뒤 실행은 부분 실행'); assert.equal(r.collection.attempted, false);
  const op = (await readRecords(dir, 'operation')).map(x => x.body).find(b => b.kind === 'daily_run');
  assert.equal(op.prediction, 'off'); assert.equal(op.runtime.event, 'schedule'); assert.equal(op.runtime.runUrl, 'https://github.com/o/r/actions/runs/7'); assert.equal(op.scheduledRunInstalled, true);
  for (const type of ['forecast', 'score', 'analysis', 'factor', 'experiment', 'model']) assert.equal((await readRecords(dir, type)).length, 0, type + ' 기록은 쓰지 않는다');
  assert.equal((await readRecords(dir, 'collection')).length, 1, '수집 기록은 남긴다(시도하지 못한 것도)');
  // 손으로 시작한 실행은 예약 실행이 아니라고 적는다
  const {dir: d2} = await fixtureRoot();
  const m = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: d2, collector: offlineCollector, env: {GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch'}});
  assert.equal(m.scheduledRunInstalled, false); assert.equal(m.runtime.event, 'workflow_dispatch');
  // 휴장일·장 마감 전: 아무것도 받지 않고 정상 종료(예비 예약이 다시 돌지 않게)
  const {dir: d3} = await fixtureRoot();
  const off = await runDaily({now: '2026-10-05T07:10:00.000Z', rootDir: d3, collector: async () => { throw Error('부르면 안 됨'); }, env: {}});
  assert.equal(off.exitCode, 0); assert.equal(off.status, 'complete'); assert.equal(off.skippedReason, '거래일이 아님');
  const early = await runDaily({now: '2026-09-29T05:00:00.000Z', rootDir: d3, collector: async () => { throw Error('부르면 안 됨'); }, env: {}});
  assert.equal(early.exitCode, 0); assert.match(early.skippedReason, /마감\(15:30\) 전/);
});

test('넷리파이: 사이트 번호는 환경변수 → 저장 파일 → 새로 만들기(파일에 적음) · 올릴 폴더는 저장소 밖 사본 · 새 사이트는 검색 제외', async () => {
  const dir = await tempRoot();
  assert.deepEqual(await resolveSite({token: 't', envSiteId: 'ENV', rootDir: dir}), {siteId: 'ENV', source: 'env', created: false});
  let calls = 0; const apiImpl = async (method, p, token, body) => { assert.equal(token, 't'); if (method === 'GET') { assert.match(p, /^\/sites\?/); return [{id: 'OTHER', name: 'someone-else'}]; } calls++; assert.equal(method, 'POST'); assert.equal(p, '/sites'); return {id: 'NEW-ID', name: body.name, ssl_url: `https://${body.name}.netlify.app`, admin_url: 'https://app.netlify.com/sites/x'}; };
  const made = await resolveSite({token: 't', envSiteId: '', rootDir: dir, apiImpl, name: 'atlas11-test'});
  assert.deepEqual([made.siteId, made.source, made.created, made.url], ['NEW-ID', 'created', true, 'https://atlas11-test.netlify.app']);
  const saved = JSON.parse(await fs.readFile(path.join(dir, 'deploy/netlify-site.json'), 'utf8'));
  assert.equal(saved.siteId, 'NEW-ID'); assert.ok(!JSON.stringify(saved).includes('"t"'), '열쇠는 파일에 쓰지 않는다');
  const again = await resolveSite({token: 't', envSiteId: '', rootDir: dir, apiImpl}); assert.equal(again.source, 'file'); assert.equal(calls, 1, '두 번째에는 새로 만들지 않는다');
  // 저장 파일을 잃어도(기록 커밋 실패) 전에 만든 atlas11-xxxxxx 사이트를 찾아 다시 쓴다 — 새 주소를 또 만들지 않는다
  const lost = await tempRoot(); let posts = 0;
  const found = await resolveSite({token: 't', envSiteId: '', rootDir: lost, apiImpl: async (method) => { if (method === 'GET') return [{id: 'OLD', name: 'atlas11-ab12cd', ssl_url: 'https://atlas11-ab12cd.netlify.app', created_at: '2026-09-30T12:11:00Z'}, {id: 'X', name: 'atlas11-notmine-long'}, {id: 'OLDER', name: 'atlas11-zz99zz', created_at: '2026-09-01T00:00:00Z'}]; posts++; return {}; }});
  assert.deepEqual([found.siteId, found.source, found.created, found.url], ['OLD', 'found', false, 'https://atlas11-ab12cd.netlify.app']); assert.equal(posts, 0);
  assert.equal(JSON.parse(await fs.readFile(path.join(lost, 'deploy/netlify-site.json'), 'utf8')).siteId, 'OLD');
  const dist = await tempRoot(); await fs.writeFile(path.join(dist, 'index.html'), '<!doctype html>'); await fs.writeFile(path.join(dist, '_headers'), '/*\n  X-Frame-Options: DENY\n');
  const st = await stageDir(dist, {noindex: true});
  assert.ok(!st.startsWith(root)); assert.match(await fs.readFile(path.join(st, '_headers'), 'utf8'), /^\/\*\n {2}X-Robots-Tag: noindex, nofollow, noarchive\n {2}X-Frame-Options: DENY/);
  assert.equal(await fs.readFile(path.join(st, 'robots.txt'), 'utf8'), 'User-agent: *\nDisallow: /\n');
  const st2 = await stageDir(dist, {noindex: false}); await assert.rejects(fs.readFile(path.join(st2, 'robots.txt')));
  assert.equal(await fs.readFile(path.join(dist, '_headers'), 'utf8'), '/*\n  X-Frame-Options: DENY\n', '원본 dist 는 바꾸지 않는다');
});

test('예비 예약 문: 오늘 52종목 정상 완료·휴장 기록이면 건너뜀 · 부분·실패·어제 기록이면 실행', async () => {
  const {alreadyDone} = await import('../../scripts/atlas11/already_done.mjs');
  const now = '2026-09-30T07:37:00.000Z';
  assert.equal(alreadyDone(null, now).skip, false);
  assert.equal(alreadyDone({dayKST: '2026-09-29', status: 'complete', exitCode: 0, confirmedTodayStocks: 52, forecastId: 'f'}, now).skip, false, '어제 기록');
  assert.equal(alreadyDone({dayKST: '2026-09-30', at: '2026-09-30T07:05:00Z', status: 'complete', exitCode: 0, confirmedTodayStocks: 52, forecastId: 'f'}, now).skip, true);
  assert.equal(alreadyDone({dayKST: '2026-09-30', status: 'partial', exitCode: 2, confirmedTodayStocks: 51, forecastId: 'f'}, now).skip, false, '51/52 부분 실행이면 예비가 다시 시도');
  assert.equal(alreadyDone({dayKST: '2026-09-30', status: 'failed', exitCode: 2}, now).skip, false);
  assert.equal(alreadyDone({dayKST: '2026-10-05', status: 'complete', session: false}, '2026-10-05T07:07:00Z').skip, true, '휴장일 기록');
  const dir = await tempRoot(); await fs.mkdir(path.join(dir, 'reports/atlas11/operations'), {recursive: true});
  await fs.writeFile(path.join(dir, 'reports/atlas11/operations/latest.json'), JSON.stringify({dayKST: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10), at: new Date().toISOString(), status: 'complete', exitCode: 0, confirmedTodayStocks: 52, forecastId: 'f'}));
  const {execFileSync} = await import('node:child_process');
  const out = execFileSync(process.execPath, [path.join(root, 'scripts/atlas11/already_done.mjs')], {cwd: dir, encoding: 'utf8'});
  assert.match(out, /^skip=true\nreason=오늘 실행 완료/);
});

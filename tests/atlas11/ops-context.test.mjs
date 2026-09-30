import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {runDaily, offlineCollector, runtimeInfo} from '../../lib/atlas11/daily.mjs';
import {readRecords, currentRecords} from '../../lib/atlas11/records.mjs';
import {resolveSite, stageDir} from '../../scripts/atlas11/deploy_netlify.mjs';
import {tempRoot, root, readJSON, INPUT_928} from './helpers.mjs';

async function fixtureRoot() {
  const dir = await tempRoot();
  await fs.mkdir(path.join(dir, 'public/data/atlas11'), {recursive: true});
  await fs.copyFile(path.join(root, INPUT_928), path.join(dir, 'public/data/input.json'));
  await fs.copyFile(path.join(root, 'reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json'), path.join(dir, 'public/data/atlas11/forecast.json'));
  for (const f of ['public/data/rolling-calendar.json', 'public/data/factor36-registry.json', 'public/data/atlas11/view/network.json', 'config/atlas11/evolution.v1.json', 'config/atlas11/scoring-policy.v1.json']) { await fs.mkdir(path.dirname(path.join(dir, f)), {recursive: true}); await fs.copyFile(path.join(root, f), path.join(dir, f)); }
  const latest = await readJSON('reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json');
  await fs.mkdir(path.join(dir, 'reports/atlas11/versions'), {recursive: true});
  await fs.writeFile(path.join(dir, 'reports/atlas11/versions', latest.forecastId + '.json'), JSON.stringify(latest));
  return {dir, latest};
}
const stubBuild = latest => async ({shadow}) => ({forecastId: shadow ? 'shadow-' + shadow.candidateId : latest.forecastId, reused: true, createdForecastFiles: 0, summary: latest.summary, actualAsOf: latest.actualAsOf});
const stubView = latest => async () => ({forecastId: latest.forecastId, files: 60});

test('실행 환경 증거: GitHub 러너 변수 → 서버·실행 주소 · 예약 실행은 schedule 이벤트일 때만 · 로컬은 수동', () => {
  const gh = runtimeInfo({GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'schedule', GITHUB_REPOSITORY: 'o/r', GITHUB_RUN_ID: '42', GITHUB_SHA: 'abc', RUNNER_OS: 'Linux'});
  assert.equal(gh.host, 'github-actions'); assert.equal(gh.scheduledRun, true); assert.equal(gh.serverInstalled, true); assert.equal(gh.runUrl, 'https://github.com/o/r/actions/runs/42');
  assert.equal(runtimeInfo({GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch'}).scheduledRun, false, '손으로 누른 실행은 예약 실행이 아니다');
  const local = runtimeInfo({}); assert.equal(local.host, 'local'); assert.equal(local.scheduledRun, false); assert.equal(local.serverInstalled, false);
});

test('매일 실행 + 관측 기록: 요인 기록이 「관측 기록 · 예측 미사용」과 「수치 입력」「미확보」를 가르고 · 운영 기록에 예약 실행 증거가 남는다', async () => {
  const {dir, latest} = await fixtureRoot();
  await fs.mkdir(path.join(dir, 'reports/atlas11/context'), {recursive: true});
  await fs.writeFile(path.join(dir, 'reports/atlas11/context/latest.json'), JSON.stringify({schema: 'atlas11-context-latest-1', day: '2026-09-28', fetchedAt: '2026-09-28T07:01:00Z', file: 'reports/atlas11/context/2026-09-28/x.json', usedInForecast: false, factors: {
    F14: {factorId: 'F14', observed: true, stocks: 52, latestObservation: '2026-09-28', lagSessions: 0, componentOnly: false, label: '외국인 순매매 수량(종목별)', note: '잠정 가능', usedInForecast: false},
    F16: {factorId: 'F16', observed: true, stocks: 52, latestObservation: '2026-09-28', lagSessions: 0, componentOnly: true, label: '기관 합계', note: '연기금 포함', usedInForecast: false},
    F06: {factorId: 'F06', observed: true, stocks: null, scope: 'market', latestObservation: '2026-09-25', calendarLagDays: 3, componentOnly: true, label: '원/달러', series: [{series: 'DEXKOUS', latestObservation: '2026-09-25', value: 1400}], usedInForecast: false},
    F35: {factorId: 'F35', observed: true, stocks: 52, latestObservation: '2026-09-28', lagSessions: 0, componentOnly: false, label: '가짜: 이미 예측에 쓰는 요인', usedInForecast: false}}}));
  const env = {GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'schedule', GITHUB_REPOSITORY: 'o/r', GITHUB_RUN_ID: '7'};
  const r = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: dir, collector: offlineCollector, runBacktests: false, build: stubBuild(latest), buildView: stubView(latest), env});
  assert.equal(r.runtime.host, 'github-actions'); assert.equal(r.scheduledRunInstalled, true); assert.equal(r.contextDay, '2026-09-28');
  const op = (await readRecords(dir, 'operation')).map(x => x.body).find(b => b.kind === 'daily_run');
  assert.equal(op.runtime.event, 'schedule'); assert.equal(op.runtime.runUrl, 'https://github.com/o/r/actions/runs/7'); assert.equal(op.scheduledRunInstalled, true);
  const fac = new Map(currentRecords(await readRecords(dir, 'factor')).map(x => [x.body.factorId, x.body]));
  assert.equal(fac.size, 36);
  assert.equal(fac.get('F14').status, '관측 기록 · 예측 미사용'); assert.equal(fac.get('F14').observedStocks, 52); assert.equal(fac.get('F14').usedInForecast, false); assert.equal(fac.get('F14').stocksUsing, 0);
  assert.equal(fac.get('F16').status, '관측 기록(일부 성분) · 예측 미사용');
  assert.equal(fac.get('F06').status, '관측 기록(일부 성분) · 예측 미사용'); assert.match(fac.get('F06').freshness, /3일 전/); assert.deepEqual(fac.get('F06').observedSeries, ['DEXKOUS']);
  assert.equal(fac.get('F35').status, '수치 입력', '예측에 이미 쓰는 요인은 관측 기록보다 「수치 입력」이 먼저다'); assert.equal(fac.get('F35').usedInForecast, true);
  assert.equal(fac.get('F01').status, '미확보');
  // 손으로 시작한 실행은 예약 실행이 아니라고 적는다
  const {dir: d2, latest: l2} = await fixtureRoot();
  const m = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: d2, collector: offlineCollector, runBacktests: false, build: stubBuild(l2), buildView: stubView(l2), env: {GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch'}});
  assert.equal(m.scheduledRunInstalled, false); assert.equal(m.runtime.event, 'workflow_dispatch');
  // 관측 파일이 오래됐으면(이틀 이상 전 거래일) 쓰지 않는다
  const {dir: d3, latest: l3} = await fixtureRoot();
  await fs.mkdir(path.join(d3, 'reports/atlas11/context'), {recursive: true}); await fs.writeFile(path.join(d3, 'reports/atlas11/context/latest.json'), JSON.stringify({day: '2026-09-22', factors: {F14: {observed: true, stocks: 52}}}));
  await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: d3, collector: offlineCollector, runBacktests: false, build: stubBuild(l3), buildView: stubView(l3), env: {}});
  const f3 = new Map(currentRecords(await readRecords(d3, 'factor')).map(x => [x.body.factorId, x.body]));
  assert.equal(f3.get('F14').status, '미확보');
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

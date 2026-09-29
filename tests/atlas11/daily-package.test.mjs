import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {runDaily, offlineCollector} from '../../lib/atlas11/daily.mjs';
import {readRecords, currentRecords} from '../../lib/atlas11/records.mjs';
import {readEvents} from '../../lib/atlas11/evolve/registry.mjs';
import {tempRoot, root, readJSON, INPUT_928} from './helpers.mjs';

/** 실제 자료 사본 + 설정 + 등록부(비어 있음). 후향 검증은 돌리지 않는다(runBacktests:false) — 검증 결과 캐시만 복사해 판정 흐름을 검사한다 */
async function fixtureRoot({withBacktests = false} = {}) {
  const dir = await tempRoot();
  await fs.mkdir(path.join(dir, 'public/data'), {recursive: true}); await fs.copyFile(path.join(root, INPUT_928), path.join(dir, 'public/data/input.json'));
  await fs.mkdir(path.join(dir, 'public/data/atlas11'), {recursive: true}); await fs.copyFile(path.join(root, 'reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json'), path.join(dir, 'public/data/atlas11/forecast.json'));
  for (const f of ['public/data/rolling-calendar.json', 'public/data/factor36-registry.json', 'public/data/atlas11/view/network.json', 'config/atlas11/evolution.v1.json', 'config/atlas11/scoring-policy.v1.json']) { await fs.mkdir(path.dirname(path.join(dir, f)), {recursive: true}); await fs.copyFile(path.join(root, f), path.join(dir, f)); }
  await fs.mkdir(path.join(dir, 'reports/atlas11/versions'), {recursive: true});
  const latest = await readJSON('reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json');
  await fs.writeFile(path.join(dir, 'reports/atlas11/versions', latest.forecastId + '.json'), JSON.stringify(latest));
  if (withBacktests) { const src = path.join(root, 'reports/atlas11/evolve/backtests'); await fs.mkdir(path.join(dir, 'reports/atlas11/evolve/backtests'), {recursive: true}); for (const f of await fs.readdir(src)) if (f.endsWith('.json')) await fs.copyFile(path.join(src, f), path.join(dir, 'reports/atlas11/evolve/backtests', f)); }
  return {dir, latest};
}
const stubBuild = latest => async ({modelSpec, modelVersion, shadow}) => ({forecastId: shadow ? 'shadow-' + shadow.candidateId : latest.forecastId, reused: true, createdForecastFiles: 0, summary: latest.summary, actualAsOf: latest.actualAsOf});
const stubView = latest => async () => ({forecastId: latest.forecastId, files: 60});

test('매일 실행기 8단계: 잠금 · 거래일 아님 · 마감 전 · 수집기 없음(부분) · 52 확정이면 발행(재사용) · 기록 8종 · 여섯 문장 · 같은 실행 두 번 = 기록 중복 0', async () => {
  const {dir, latest} = await fixtureRoot();
  await fs.mkdir(path.join(dir, 'reports/atlas11/operations'), {recursive: true});
  await fs.writeFile(path.join(dir, 'reports/atlas11/operations/run.lock'), '{}');
  const locked = await runDaily({now: '2026-09-28T08:00:00.000Z', rootDir: dir, runBacktests: false});
  assert.equal(locked.status, 'already_running_or_unresolved_lock'); assert.equal(locked.exitCode, 2);
  await fs.unlink(path.join(dir, 'reports/atlas11/operations/run.lock'));
  // 거래일 아님(일요일): 수집·발행 건너뜀, 채점·보고서는 남김
  const sunday = await runDaily({now: '2026-09-27T08:00:00.000Z', rootDir: dir, runBacktests: false, build: stubBuild(latest), buildView: stubView(latest)});
  assert.equal(sunday.session, false); assert.equal(sunday.newForecast, false); assert.equal(sunday.steps.find(s => s.step === '2_collect').skipped, true); assert.match(sunday.forecastWithheldReason, /거래일이 아님/);
  // 마감 전
  const early = await runDaily({now: '2026-09-28T03:00:00.000Z', rootDir: dir, runBacktests: false, build: stubBuild(latest), buildView: stubView(latest)});
  assert.equal(early.afterClose, false); assert.equal(early.newForecast, false); assert.match(early.forecastWithheldReason, /마감/);
  // 마감 후 · 수집기 없음 · 저장 자료로 52 확정 → 발행(재사용) · 부분 실패
  let built = 0; const build = async args => { built++; return stubBuild(latest)(args); };
  const run = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: dir, collector: offlineCollector, runBacktests: false, build, buildView: stubView(latest)});
  assert.equal(built, 1); assert.equal(run.confirmedTodayStocks, 52); assert.equal(run.collection.attempted, false); assert.equal(run.exitCode, 2); assert.equal(run.status, 'partial'); assert.equal(run.reusedSameInput, true);
  assert.deepEqual(run.steps.map(s => s.step), ['1_calendar', '2_collect', '3_validate_store', '4_score', '5_analyze', '6_publish', '7_evolve', '8_report_view']); assert.ok(run.steps.every(s => s.status === 'ok'));
  assert.ok(run.scoreId); assert.equal(run.scoring.evaluated, 0, '9/28 발행본은 9/29 종가부터 채점'); assert.ok(run.scoring.pending > 1000);
  const latestOp = JSON.parse(await fs.readFile(path.join(dir, 'reports/atlas11/operations/latest.json'), 'utf8')); assert.equal(latestOp.at, run.at);
  // 기록 8종 중 이 날 생기는 것: 수집·예측·원인분석(총괄)·요인 36·운영 (채점·실험·모델은 자료가 생겨야)
  const totals = run.ledger.totals; assert.equal(totals.collection, 1); assert.equal(totals.forecast, 1); assert.equal((await readRecords(dir, 'factor', {dates: ['2026-09-28']})).length, 36, '요인 36개 기록(그 날)'); assert.ok(totals.operation >= 1); assert.equal(totals.score, 0);
  const report = JSON.parse(await fs.readFile(path.join(dir, 'public/data/atlas11/daily/2026-09-28.json'), 'utf8')); assert.equal(Object.keys(report.sentences).length, 6); assert.match(report.sentences.didWell, /채점된 전망이 없습니다/); assert.match(report.sentences.nextCheck, /9월 29일/);
  // 같은 시각 실행을 다시 하면 기록이 늘지 않는다(중복 실행 안전)
  const again = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: dir, collector: offlineCollector, runBacktests: false, build: stubBuild(latest), buildView: stubView(latest)});
  assert.equal(again.ledger.totals.collection, 1); assert.equal(again.ledger.totals.forecast, 1); assert.equal((await readRecords(dir, 'factor', {dates: ['2026-09-28']})).length, 36);
  // 51개만 확정이면 발행하지 않는다
  const input = JSON.parse(await fs.readFile(path.join(dir, 'public/data/input.json'), 'utf8'));
  input.assets[0].prices = input.assets[0].prices.filter(p => p.date !== '2026-09-28'); await fs.writeFile(path.join(dir, 'public/data/input.json'), JSON.stringify(input));
  const partial = await runDaily({now: '2026-09-28T13:50:00.000Z', rootDir: dir, runBacktests: false, build: async () => { throw Error('should not build'); }});
  assert.equal(partial.confirmedTodayStocks, 51); assert.equal(partial.newForecast, false); assert.match(partial.forecastWithheldReason, /51\/52/); assert.deepEqual(partial.unconfirmedCodes, ['005930']);
});

test('중단 뒤 이어서 실행: 발행 단계에서 죽어도 다음 실행이 같은 결과로 마무리하고 기록은 두 번 쌓이지 않는다 · 예약 종료 뒤에는 발행 없이 채점만', async () => {
  const {dir, latest} = await fixtureRoot();
  const crash = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: dir, runBacktests: false, build: async () => { throw Error('DISK_FULL'); }, buildView: stubView(latest)});
  assert.equal(crash.status, 'failed'); assert.equal(crash.exitCode, 2); assert.match(crash.error, /DISK_FULL/);
  assert.ok(!(await fs.stat(path.join(dir, 'reports/atlas11/operations/run.lock')).catch(() => null)), '잠금은 풀려야 한다');
  const resumed = await runDaily({now: '2026-09-28T13:46:00.000Z', rootDir: dir, runBacktests: false, build: stubBuild(latest), buildView: stubView(latest)});
  assert.equal(resumed.status, 'partial'); assert.equal(resumed.forecastId, latest.forecastId);
  const ops = await readRecords(dir, 'operation'); assert.ok(ops.some(r => r.body.kind === 'daily_run_failed') && ops.some(r => r.body.kind === 'daily_run'));
  assert.equal((await readRecords(dir, 'collection')).length, 1, '내용이 같은 수집 기록(같은 날 · 시도 안 함)은 하나만 남는다 — 내용 해시 ID');
  // 예약 종료 뒤(11/2): 새 발행 없음 · 채점은 계속
  const after = await runDaily({now: '2026-11-02T08:00:00.000Z', rootDir: dir, runBacktests: false, build: async () => { throw Error('should not build after end'); }, buildView: stubView(latest)});
  assert.equal(after.afterPublishEnd, true); assert.match(after.forecastWithheldReason, /예약 종료일/); assert.equal(after.newForecast, false); assert.equal(after.steps.find(s => s.step === '4_score').status, 'ok');
});

test('수집 관측값 검증: 출처·해시·시각이 없는 관측은 거부되고 실패로 기록된다', async () => {
  const {dir} = await fixtureRoot();
  const bad = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: dir, runBacktests: false, collector: async () => ({attempted: true, provider: 'test', observations: [{code: '005930', sourceUrl: 'http://insecure.example', rows: [{date: '2026-09-28', open: 1, high: 1, low: 1, close: 1, volume: 1}]}], errors: []})});
  assert.equal(bad.status, 'failed_validation'); assert.match(bad.error, /PRICE_PROVENANCE/);
});

test('진화 단계: 캐시된 후보 검증 11개를 평가해 사건 장부·실험 기록을 남기고, 어느 것도 관문을 다 넘지 못해 운영 A 유지 · 두 번 실행해도 사건 중복 없음', async () => {
  const {dir, latest} = await fixtureRoot({withBacktests: true});
  const run = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: dir, runBacktests: true, backtestTimeBudgetMs: 1, build: stubBuild(latest), buildView: stubView(latest)});
  assert.equal(run.evolution.backtested, 11); assert.equal(run.evolution.adopted, 0); assert.equal(run.evolution.rejected, 11); assert.equal(run.operatingModelAfter, 'atlas11-A-1');
  const exps = currentRecords(await readRecords(dir, 'experiment')); assert.equal(exps.length, 11);
  const p330 = exps.find(r => r.body.label === '벌점 [3,30]'); assert.ok(p330.body.four.candidateErrorPct < p330.body.four.operatingErrorPct && p330.body.four.candidateRankHits >= p330.body.four.operatingRankHits, '네 숫자 규칙은 통과');
  assert.equal(p330.body.gates.direction, false, '그러나 방향 관문에서 걸린다'); assert.equal(p330.body.status, '기각');
  assert.ok(exps.every(r => r.body.status === '기각'));
  const events1 = await readEvents(dir);
  const again = await runDaily({now: '2026-09-28T13:45:00.000Z', rootDir: dir, runBacktests: true, backtestTimeBudgetMs: 1, build: stubBuild(latest), buildView: stubView(latest)});
  assert.equal(again.evolution.backtested, 0, '이미 판정한 후보는 다시 판정하지 않는다');
  assert.equal((await readEvents(dir)).length, events1.length + 1, '두 번째 실행은 「변경 없음」 사건 하나만 추가');
});

test('배포 묶음: index.html 최상위 · 화면 자료·CSV 포함 · 비밀키 없음 · 원본 대용량 제외', async () => {
  const dist = path.join(root, 'dist');
  const names = await fs.readdir(dist);
  assert.ok(names.includes('index.html') && names.includes('app') && names.includes('data') && names.includes('downloads'));
  const manifest = JSON.parse(await fs.readFile(path.join(dist, 'dist-manifest.json'), 'utf8'));
  assert.ok(manifest.files > 200); assert.ok(manifest.bytes < 40e6, '소스 대용량(atlas.json 91MB 등) 제외');
  assert.ok(Object.keys(manifest.hashes).some(f => f.startsWith('downloads/atlas11/') && f.endsWith('.csv')));
  assert.ok(!Object.keys(manifest.hashes).includes('data/atlas.json'));
  const app = await fs.readFile(path.join(dist, 'app/app.js'), 'utf8');
  assert.ok(!/FRED_API_KEY\s*=|NAVER_CLIENT_SECRET\s*=|KRX_API_KEY\s*=/.test(app));
});

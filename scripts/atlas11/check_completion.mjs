#!/usr/bin/env node
/**
 * ATLAS 11 · 명령서 11절 「완료 증거」를 저장소의 실제 자료로 다시 검사한다(문서의 옛 숫자를 옮겨 적지 않는다).
 *   node scripts/atlas11/check_completion.mjs [--now ISO] → reports/atlas11/verify/completion-<시각>.json + completion-latest.md
 * 판정은 셋: 통과(실제 자료로 확인) · 대기(연결됐지만 아직 실행 증거가 없음) · 미연결(필요한 조치가 남음)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {readRecords, currentRecords, LEDGER_TYPES} from '../../lib/atlas11/records.mjs';

const root = process.cwd();
const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : process.argv[i + 1]; };
const now = arg('--now') ?? new Date().toISOString();
const read = async (f, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, f), 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };
const exists = async f => { try { await fs.access(path.join(root, f)); return true; } catch { return false; } };
const git = args => { try { return execFileSync('git', args, {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}); } catch { return null; } };
const items = [];
const item = (no, title, verdict, evidence, action = null) => items.push({no, title, verdict, evidence, action});

const pub = await read('public/data/atlas11/forecast.json');
const cal = await read('public/data/rolling-calendar.json');
const input = await read('public/data/input.json');
const sessions = cal.sessions, holidays = new Set(Object.keys(cal.holidays ?? {}));

// 1. 52종목 처리 · 36요인
const opsDir = 'reports/atlas11/operations';
const opFiles = (await fs.readdir(path.join(root, opsDir))).filter(f => /^\d{4}-\d{2}-\d{2}T.*\.json$/.test(f)).sort();
const ops = []; for (const f of opFiles) ops.push({file: f, ...(await read(path.join(opsDir, f)))});
const lastComplete = [...ops].reverse().find(o => o.confirmedTodayStocks != null);
const factorRecs = currentRecords(await readRecords(root, 'factor')), lastDay = factorRecs.map(r => r.body.day).sort().at(-1);
const lastByFactor = new Map(); for (const r of factorRecs.filter(r => r.body.day === lastDay).sort((a, b) => String(a.at).localeCompare(String(b.at)))) lastByFactor.set(r.body.factorId, r.body);
const fStatus = {}; for (const b of lastByFactor.values()) fStatus[b.status] = (fStatus[b.status] ?? 0) + 1;
const used = [...lastByFactor.values()].filter(b => b.stocksUsing > 0).map(b => b.factorId).sort(), observedOnly = [...lastByFactor.values()].filter(b => !b.stocksUsing && /^관측 기록/.test(b.status)).map(b => b.factorId).sort(), missing = [...lastByFactor.values()].filter(b => b.status === '미확보').map(b => b.factorId).sort();
item(1, '52종목 처리 성공·실패 수 · 36요인 확보·실제 사용·미확보', pub.assets.length === 52 && pub.summary.anchorMatches === 52 && lastByFactor.size === 36 ? '통과' : '미연결',
  {stocks: pub.assets.length, confirmedCloses: pub.summary.finalCloseStocks, lastRunConfirmedToday: lastComplete ? `${lastComplete.confirmedTodayStocks}/52 (${lastComplete.at})` : null, factorDay: lastDay, factorStatus: fStatus, usedInForecast: used, observedNotUsed: observedOnly, missing},
  missing.length ? `미확보 ${missing.length}개(기업 실적·수주·재고·공매도·연기금 세부 등)는 열쇠가 필요한 공식 자료(OpenDART·KRX·한국은행 ECOS) 또는 유료 자료가 있어야 함` : null);

// 2. 출발점 0 · 다음 실제 거래일 20 · 휴장일 오류 0
const i0 = sessions.indexOf(pub.actualAsOf), expected = sessions.slice(i0 + 1, i0 + 21);
const anchorZero = pub.assets.filter(a => a.rows[0].date === a.anchor.date && a.rows[0].p50 === a.anchor.close && a.anchor.date === pub.actualAsOf).length;
const datesOk = JSON.stringify(pub.futureDates) === JSON.stringify(expected) && pub.assets.every(a => JSON.stringify(a.rows.slice(1).map(r => r.date)) === JSON.stringify(expected));
const holidayErrors = pub.futureDates.filter(d => holidays.has(d) || [0, 6].includes(new Date(d + 'T00:00:00Z').getUTCDay())).length;
item(2, '52종목 출발점 차이 0원 · 다음 실제 거래일 20개 · 휴장일 오류 0', anchorZero === 52 && datesOk && holidayErrors === 0 ? '통과' : '미연결',
  {forecastId: pub.forecastId, actualAsOf: pub.actualAsOf, anchorGapZero: `${anchorZero}/52`, futureDates: `${pub.futureDates[0]} ~ ${pub.futureDates.at(-1)} (${pub.futureDates.length}개)`, skippedHolidays: Object.keys(cal.holidays ?? {}).filter(d => d > pub.actualAsOf && d <= pub.futureDates.at(-1)), holidayErrors});

// 3. 과거 전망 보존 · 미래 정보 차단 · 미채점
const versions = [...(await fs.readdir(path.join(root, 'reports/atlas11/versions'))).filter(f => f.endsWith('.json')).map(f => 'atlas11/' + f), ...(await fs.readdir(path.join(root, 'reports/rolling/versions')).catch(() => [])).filter(f => f.endsWith('.json')).map(f => 'rolling/' + f)];
const modifiedLog = git(['log', '--diff-filter=MD', '--name-only', '--format=%H', '--', 'reports/atlas11/versions', 'reports/rolling/versions']);
const modified = modifiedLog !== null ? [...new Set(modifiedLog.split('\n').filter(l => l.startsWith('reports/')))] : null;
const scores = currentRecords(await readRecords(root, 'score')).map(r => r.body);
const closeInstant = d => Date.parse(d + 'T06:30:00Z');
const leak = scores.filter(c => Date.parse(c.issuedAt) >= closeInstant(c.targetDate) || c.targetDate > input.actualAsOf).length;
item(3, '과거 전망 보존 · 미래 정보 차단 · 아직 오지 않은 목표일 미채점', modified && modified.length === 0 && leak === 0 ? '통과' : modified === null ? '대기' : '미연결',
  {publicationFiles: versions.length, publicationFilesModifiedOrDeletedInGit: modified, scoredCells: scores.length, cellsIssuedAfterTargetCloseOrBeyondActual: leak, latestActual: input.actualAsOf});

// 4. 정답·오답 양쪽 · 날짜·종류별 검색·내려받기
const byClass = {}; for (const c of scores.filter(c => c.kind === 'live')) byClass[c.classLabel] = (byClass[c.classLabel] ?? 0) + 1;
const idx = await read('public/data/atlas11/ledger/index.json');
const csvs = (await fs.readdir(path.join(root, 'public/downloads/atlas11/ledger'))).filter(f => f.endsWith('.csv'));
item(4, '정답·오답 양쪽 기록 · 날짜·종류별 검색·내려받기', Object.keys(byClass).length >= 2 && LEDGER_TYPES.every(t => idx.types.some(x => x.id === t)) && csvs.length > 0 ? '통과' : '미연결',
  {liveCellsByClass: byClass, ledgerTotals: idx.totals, ledgerDates: idx.dates, csvFiles: csvs.length, filters: Object.keys(idx.facets)});

// 5. 후보와 운영 모델 · 네 숫자 · 채택·보류 이유
const state = await read('reports/atlas11/evolve/state.json', null), A = await read('reports/atlas11/evolve/backtests/A.json', null);
const bts = []; for (const f of (await fs.readdir(path.join(root, 'reports/atlas11/evolve/backtests'))).filter(f => f.startsWith('cand-'))) { const b = await read('reports/atlas11/evolve/backtests/' + f); bts.push({id: b.spec?.id ?? f.slice(0, -5), label: b.spec?.label, meanErrorPct: b.summary?.meanErrorPct, rankHits: b.summary?.rankHits}); }
const events = (await fs.readFile(path.join(root, 'reports/atlas11/evolve/registry.jsonl'), 'utf8')).split('\n').filter(Boolean).map(l => JSON.parse(l));
const decisions = {}; for (const e of events) decisions[e.type] = (decisions[e.type] ?? 0) + 1;
item(5, '후보와 운영 모델의 실제 차이 · 비교 숫자 4개 · 채택·보류 이유', A && bts.length === 11 ? '통과' : '미연결',
  {operating: A ? {meanErrorPct: A.summary.meanErrorPct, rankHits: A.summary.rankHits, origins: A.origins} : null, candidates: bts, registryEvents: decisions, operatingModel: state?.operating?.modelVersion ?? null, lastDecision: events.filter(e => ['rejected', 'adopted', 'no_change', 'rolled_back'].includes(e.type)).at(-1) ?? null});

// 6. 중복 실행·부분 수집·재시작·모델 복귀
const tap = await fs.readFile(path.join(root, 'reports/atlas11/tests.tap'), 'utf8').catch(() => '');
const pass = tap.match(/^# pass (\d+)/m)?.[1], fail = tap.match(/^# fail (\d+)/m)?.[1];
const names = [...tap.matchAll(/^ok \d+ - (.+)$/gm)].map(m => m[1]);
const pick = re => names.filter(n => re.test(n)).slice(0, 3);
const realRepeats = ops.filter(o => o.scoring && o.scoring.duplicates > 0).map(o => ({at: o.at, newRecords: o.scoring.newRecords, duplicates: o.scoring.duplicates}));
item(6, '중복 실행·부분 수집·재시작·모델 복귀가 작동한 증거', Number(fail) === 0 && pick(/같은 실행 두 번|기록 중복 0|중복 없음|새 기록 0/).length && pick(/이어서|중단/).length && pick(/복귀|되돌/).length ? '통과' : '미연결',
  {tests: `${pass}/${Number(pass) + Number(fail)} 통과`, duplicateTests: pick(/같은 실행 두 번|기록 중복 0|중복 없음|새 기록 0/), resumeTests: pick(/이어서|중단/), partialTests: pick(/부분|51\/52|TODAY_NOT_FINAL/), rollbackTests: pick(/복귀|되돌/), realRunsWithDuplicatesSkipped: realRepeats.slice(-5), note: '모델 복귀는 실제로 일어난 적 없음(채택된 후보가 없어 복귀할 대상도 없음) — 검사 입력으로만 확인'});

// 7. 서버 스케줄러 연결 · 실제 예약 실행 기록
const wf = await fs.readFile(path.join(root, '.github/workflows/atlas11-daily.yml'), 'utf8').catch(() => '');
const crons = [...wf.matchAll(/cron:\s*'([^']+)'/g)].map(m => m[1]), cron = crons[0] ?? null;
const scheduled = ops.filter(o => o.runtime?.event === 'schedule'), manualGh = ops.filter(o => o.runtime?.host === 'github-actions' && o.runtime?.event !== 'schedule');
item(7, '서버 스케줄러 연결 상태와 실제 예약 실행 기록', cron && scheduled.length ? '통과' : cron ? '대기' : '미연결',
  {workflow: '.github/workflows/atlas11-daily.yml', crons, meaning: crons.map(c => { const [m, h] = c.split(/\s+/); return `${String((Number(h) + 9) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')} KST`; }).join(' · ') + ' (평일 · 첫째가 기본 · 나머지는 예비)', scheduledRuns: scheduled.map(o => ({at: o.at, status: o.status, runUrl: o.runtime.runUrl, confirmedTodayStocks: o.confirmedTodayStocks ?? null})), manualGithubRuns: manualGh.length, earlierGithubRunsWithoutRuntimeField: ops.filter(o => !o.runtime && o.at >= '2026-09-29T09:00:00Z').length},
  scheduled.length ? null : '첫 예약 실행(평일 16:00 KST) 뒤 다시 검사');

// 8. 화면 캡처 · 그래프 좌표
const br = await read('reports/atlas11/browser/latest.json', null);
item(8, 'PC·모바일 주요 화면 캡처와 그래프 좌표 검증', br && br.failed === 0 && br.passed > 0 ? '통과' : '미연결', {browser: br ? {passed: br.passed, failed: br.failed, at: br.at ?? br.finishedAt ?? null} : null, coordinateChecks: (br?.checks ?? []).filter(c => /좌표|경계|실제선|띠/.test(c.name)).map(c => `${c.ok ? 'ok' : 'FAIL'} ${c.name}`).slice(0, 8), note: '헤드리스 크롬(PC 1280×800 · 모바일 390×844 · 어두운 화면) · 실제 휴대폰 기기 검사 아님'});

// 9. 소스·의존성·설정·설명서·배포물
const files = ['package.json', 'package-lock.json', 'deploy/atlas11.env.example', 'docs/ATLAS11_README.md', '.github/workflows/atlas11-daily.yml', '.github/workflows/atlas11-site.yml', '.github/workflows/atlas11-context.yml', 'scripts/atlas11/deploy_netlify.mjs'];
const have = {}; for (const f of files) have[f] = await exists(f);
const deploy = await read('reports/atlas11/operations/deploy-latest.json', null);
item(9, '실행 가능한 소스 · 의존성 고정 · 설정 예시 · 운영 설명서 · 배포용 결과물', Object.values(have).every(Boolean) ? (deploy?.state === 'ready' ? '통과' : '대기') : '미연결',
  {files: have, siteDeploy: deploy ? {state: deploy.state, url: deploy.url, at: deploy.at} : null, dropZip: '매일 실행이 GitHub 산출물(atlas11-drop-<번호>)로 올림'},
  deploy?.state === 'ready' ? null : '넷리파이 열쇠(NETLIFY_AUTH_TOKEN)를 저장소 비밀에 넣으면 매일 화면이 자동으로 올라감(없으면 Drop ZIP 을 손으로 올려야 함)');

// 10. 관측 수집(시장·수급·뉴스·공시·거시)
const ctx = await read('reports/atlas11/context/latest.json', null);
const ctxFile = ctx ? await read(ctx.file, null) : null;
item(10, '시장·수급·뉴스·공시·거시 관측 수집(기록 · 예측 미사용)', ctx && ctxFile ? '통과' : '미연결',
  ctx ? {day: ctx.day, fetchedAt: ctx.fetchedAt, sources: `${ctxFile.sources.filter(s => s.ok).length}/${ctxFile.sources.length}`, errors: ctx.errors, factorsObserved: Object.values(ctx.factors).filter(f => f.observed).map(f => f.factorId).sort(), index: ctx.summary.index, news: ctx.summary.news, flows: {stocks: ctx.summary.flows.stocks, withToday: ctx.summary.flows.stocksWithToday}, usedInForecast: false} : null,
  '정규장 시가·고가·저가·거래량은 여전히 비어 있음 — 한국거래소 Open API 이용 신청·승인 열쇠가 있어야 대체거래소 거래가 섞이지 않은 값을 받을 수 있음');

// 11. 검사용 가짜 입력과 실제 자료 분리 · 비밀 없음
const fixtureDirs = (await fs.readdir(path.join(root, 'tests/atlas11/fixtures'))).sort();
const secretHits = git(['grep', '-nIE', '(nfp_[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|NETLIFY_AUTH_TOKEN\\s*=\\s*[A-Za-z0-9_-]{16,})', '--', '.', ':!node_modules']);
item(11, '검사용 가짜 입력과 실제 시장 자료 분리 · 비밀 열쇠 없음', !secretHits ? '통과' : '미연결', {fixtures: fixtureDirs, realInput: 'public/data/input.json (검사는 tests/atlas11/fixtures/input-2026-09-28.json 사본만 씀)', secretPatternHits: secretHits ? secretHits.split('\n').filter(Boolean).length : 0});

const summary = {schema: 'atlas11-completion-check-1', at: now, commit: git(['rev-parse', '--short', 'HEAD'])?.trim() ?? null, counts: {통과: items.filter(i => i.verdict === '통과').length, 대기: items.filter(i => i.verdict === '대기').length, 미연결: items.filter(i => i.verdict === '미연결').length}, items};
const dir = path.join(root, 'reports/atlas11/verify'); await fs.mkdir(dir, {recursive: true});
await fs.writeFile(path.join(dir, `completion-${now.replace(/[:.]/g, '-')}.json`), JSON.stringify(summary, null, 2));
const md = ['# ATLAS 11 · 완료 증거 검사 — ' + now, '', `커밋 ${summary.commit} · 통과 ${summary.counts.통과} · 대기 ${summary.counts.대기} · 미연결 ${summary.counts.미연결}`, '', ...items.flatMap(i => [`## ${i.no}. ${i.title} — ${i.verdict}`, '```json', JSON.stringify(i.evidence, null, 1).slice(0, 2400), '```', ...(i.action ? ['필요한 조치: ' + i.action, ''] : [''])])].join('\n');
await fs.writeFile(path.join(dir, 'completion-latest.md'), md);
await fs.writeFile(path.join(dir, 'completion-latest.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({counts: summary.counts, items: items.map(i => `${i.no} ${i.verdict} ${i.title}`)}, null, 1));

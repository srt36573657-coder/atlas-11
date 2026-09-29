import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { ROLLING_AB_PROTOCOL, runRollingBacktest } from '../lib/rolling-backtest.mjs';

const sha = x => createHash('sha256').update(x).digest('hex');
const directory = 'reports/rolling';
await fs.mkdir(directory, { recursive: true });
const inputBytes = await fs.readFile('public/data/atlas.json'), bundle = JSON.parse(inputBytes);
const codeFiles = ['lib/rolling-backtest.mjs', 'lib/factor36.mjs', 'lib/factor36-simulation.mjs', 'scripts/backtest_rolling.mjs'];
const code = await Promise.all(codeFiles.map(f => fs.readFile(f)));
const evidence = { protocol: ROLLING_AB_PROTOCOL, inputSHA256: sha(inputBytes), implementationSHA256: sha(Buffer.concat(code)) };
const evidenceSHA256 = sha(JSON.stringify(evidence)), runId = 'ab-' + evidenceSHA256.slice(0, 16), runDir = path.join(directory, runId);
await fs.mkdir(runDir, { recursive: true });
const protocolFile = path.join(runDir, 'protocol.json'), resultFile = path.join(runDir, 'result.json');
let prior;
try { prior = JSON.parse(await fs.readFile(resultFile, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
if (prior) { console.log(JSON.stringify({ reused: true, runId, A: prior.A, B: prior.B, decision: prior.decision })); process.exit(0); }
const declared = { ...evidence, evidenceSHA256, declaredAt: new Date().toISOString(), note: 'Metric rules and simulation count stored before inspecting outcomes. Paths chosen from runtime-only benchmark; no outcome-based selection.' };
try { await fs.writeFile(protocolFile, JSON.stringify(declared, null, 2), { flag: 'wx' }); }
catch (e) { if (e.code !== 'EEXIST') throw e; const old = JSON.parse(await fs.readFile(protocolFile, 'utf8')); if (old.evidenceSHA256 !== evidenceSHA256) throw Error('AB_PROTOCOL_CONFLICT'); }
const protocolBytes = await fs.readFile(protocolFile), startedAt = new Date().toISOString();
const ledger = ['origin,block,code,horizon,target,anchor,actual,A,B,errorA_pct,errorB_pct'];
const result = await runRollingBacktest(bundle.input, { onRows: rows => { for (const r of rows) ledger.push([r.origin, r.block, r.code, r.horizon, r.target, r.anchor, r.actual, r.A, r.B, r.errorA, r.errorB].join(',')); }, onProgress: p => { if (p.complete % 10 === 0) console.log(JSON.stringify(p)); } });
const inputSnapshot = Buffer.from(JSON.stringify(bundle.input));
await fs.writeFile(path.join(runDir, 'input.json.gz'), gzipSync(inputSnapshot, { level: 9 }), { flag: 'wx' });
const output = { inputSnapshotSHA256: sha(inputSnapshot), inputSnapshotFile: path.join(runDir, 'input.json.gz'), ...result, runId, evidenceSHA256, protocolSHA256: sha(protocolBytes), inputSHA256: evidence.inputSHA256, implementationSHA256: evidence.implementationSHA256, startedAt, finishedAt: new Date().toISOString() };
const csvBytes = Buffer.from(ledger.join('\n') + '\n'), compressed = gzipSync(csvBytes, { level: 9 });
await fs.writeFile(path.join(runDir, 'paired-errors.csv.gz'), compressed, { flag: 'wx' });
output.ledger = { file: path.join(runDir, 'paired-errors.csv.gz'), rows: ledger.length - 1, uncompressedSHA256: sha(csvBytes), compressedSHA256: sha(compressed) };
await fs.writeFile(resultFile, JSON.stringify(output, null, 2), { flag: 'wx' });
const latest = { ...output, byDate: undefined, byStock: undefined, blockDetails: undefined, resultFile };
await fs.writeFile(path.join(directory, 'ab-latest.json'), JSON.stringify(latest, null, 2));
await fs.writeFile(path.join(directory, 'ab-protocol.md'), `# A/B 사전 비교 규칙\n\n사전 저장: ${declared.declaredAt}\n\n기존 A도 자기 종목의 실제 종가를 기준점으로 읽는다. B는 같은 방정식과 실제 관측 상태를 사용하는 새 발행/화면 구조이며, 다른 가격 모형이 아니다. 따라서 같은 모형/입력/난수의 쌍별 결과는 같다. 일부러 잘못된 누적 예측형 A를 만들지 않는다.\n\n120개 기준일을 20개씩 6블록으로 나눈다. 블록 첫 기준일까지의 관측으로만 학습·선택하며 블록 중 계수는 고정, 특징과 변동성은 매일 실제 관측으로 재계산한다. 각 기준일의 다음 20거래일을 모두 평가한다. 가격 오차는 |예측−실제|/실제×100, 각 날짜에 동일한 52종목×20시점 평균을 낸 뒤 날짜 평균이다. 순위 적중은 20거래일 수익률의 예상 상위5와 실제 상위5 교집합 수(일별0~5)를 합한다. 동률은 코드순이다. B 가격오차가 엄격히 낮고 순위 적중이 같거나 높아야만 B를 채택한다.\n\nMonte Carlo 512공통 경로를 사전에 고정했다. 발행용20,000경로의 성능 검증이 아니다. A/B 동등성 확인은 독립적인 두 시험이 아니다. 동일 종목/기간/난수로 비교하며 겹치는 미래20일을 독립120시험으로 부르지 않는다. NAVER 보관 가격의 당시 빈티지·기업행위 조정은 미검증이므로 후향 진단이다. 외부 뉴스/수급 요인은 당시의 학습 자격이 없어 0개 사용한다.\n`);
const audit = { at: output.finishedAt, existingA: { anchor: 'assets[i].prices.find(date===panel.dates.at(-1)).close', source: 'lib/factor36-simulation.mjs', state: 'features from panel actual returns; volatility updated from actual residuals after trainedThrough', oldForecastRead: false }, newB: { mathematicalChange: false, changes: ['20-session rolling publication', 'daily immutable files', 'actual-versus-forecast evaluation', 'today/yesterday display'], oldForecastReadForNumerics: false }, result: { numericallyMeasuredAnchorOutputDifference: null, observedOriginCloseChecks: output.byStock.reduce((n, s) => n + s.observedOriginCloseChecks, 0), anchorVerification: 'structural_source_path_review; simulator_does_not_output_anchor_row; production_publication_anchor_test_is_separate', maximumABPriceDifference: output.maxABDifference, directPredictionErrorPropagationFound: false }, errorAutocorrelation: output.byStock.map(s => ({ code: s.code, value: s.signedOneDayErrorLag1Correlation, causal: false })), samsungSeptember28: { code: '005930', userReportedActualPct: -4.90, userReportedForecastPct: -0.06, userReportedGapPctPoints: 4.84, verifiedFromStoredSeptember28Actual: false, verifiedFromIssuedForecast: false, causalDecomposition: null, reason: 'The stored actual input ends at ' + bundle.input.actualAsOf + '; user example is a hypothesis, not an ingested observation. Missing verified contemporaneous flows/news also precludes causal decomposition.' }, limitations: ['Lagged error correlation is association, not propagation proof.', 'Numerical engine never reads old forecast price as the next anchor.', 'Other data omissions, shocks and model misspecification remain possible; no unsupported causal percentages.'] };
await fs.writeFile(path.join(directory, 'ab-error-propagation.json'), JSON.stringify(audit, null, 2));
if (sha(await fs.readFile('public/data/atlas.json')) !== evidence.inputSHA256) throw Error('AB_INPUT_CHANGED_DURING_RUN');
console.log(JSON.stringify({ runId, days: output.originDays, blocks: output.blocks, stocks: output.stocks, rows: output.stockTargetRows, A: output.A, B: output.B, decision: output.decision }));

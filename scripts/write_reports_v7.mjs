/** Current v7 report. Legacy v6 scores remain evidence about the archived v6 engine only. */
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { checkForecast, MODEL_VERSION } from '../lib/news-engine.mjs';
import { scopeCounts } from '../lib/news-scope.mjs';
import { eventClusterKey } from '../lib/event-evidence-v7.mjs';
const root = new URL('../', import.meta.url);
const read = path => fs.readFile(new URL(path, root), 'utf8');
const json = async path => JSON.parse(await read(path));
const hash = value => createHash('sha256').update(value).digest('hex');
const jsonHash = value => hash(JSON.stringify(value));
const write = async (path, value) => {
  const url = new URL(path, root); await fs.mkdir(new URL('.', url), { recursive: true });
  await fs.writeFile(url, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
};
const [bundle, baseline, audit, sensitivity, numerics, collection, auditReview, tap, pkg] = await Promise.all([
  json('public/data/atlas.json'), json('reports/rebuild52-before/preservation.json'),
  json('reports/model_audit.json'), json('reports/seed_sensitivity.json'),
  json('reports/numerics-10000.json'), json('reports/collection52/latest.json'),
  read('reports/rebuild52-audit-review.md'), read('reports/tests.tap'), json('package.json'),
]);
const summaryNumber = name => Number([...tap.matchAll(new RegExp('^(?:#|ℹ) ' + name + ' (\\d+)\\s*$', 'gm'))].at(-1)?.[1]);
const tests = { total: summaryNumber('tests'), passed: summaryNumber('pass'), failed: summaryNumber('fail'),
  cancelled: summaryNumber('cancelled'), skipped: summaryNumber('skipped'), todo: summaryNumber('todo'),
  source: 'reports/tests.tap', sha256: hash(tap), accuracyCertification: false };
if (!(tests.passed > 0) || tests.failed !== 0 || tests.cancelled !== 0 || !Number.isFinite(tests.total)) throw Error('Completed passing tests.tap is required.');
if (MODEL_VERSION !== 'atlas-news-7.0.0' || bundle.candidate.modelVersion !== MODEL_VERSION) throw Error('Install the v7 candidate before writing current reports.');
if (bundle.input.origin !== '2026-09-17' || bundle.input.end !== '2026-10-30') throw Error('Fixed prediction window changed.');
const originalHash = jsonHash(bundle.original);
if (originalHash !== '1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca' || originalHash !== baseline.original) throw Error('Original reconstruction changed.');
const originalCodes = bundle.original.assets.map(a => a.code).sort();
for (const assets of [bundle.input.assets, bundle.candidate.assets]) {
  if (assets.length !== 52 || new Set(assets.map(a => a.code)).size !== 52 || JSON.stringify(assets.map(a => a.code).sort()) !== JSON.stringify(originalCodes)) throw Error('Original 52-stock universe changed.');
}
const latest = checkForecast(bundle.candidate, bundle.input), original = checkForecast(bundle.original, bundle.input);
if (!latest.complete || !latest.ok || !original.complete) throw Error('Forecast row validation failed.');
if (bundle.candidate.trustProbability !== null || bundle.candidate.assets.some(a => a.evidence?.trustProbability !== null)) throw Error('Uncertified trust probability must remain null.');
const versions = new Map([bundle.original, ...(bundle.priorVersions ?? []), bundle.candidate].map(v => [v.id, v]));
for (const [id, expected] of Object.entries(baseline.versions)) if (jsonHash(versions.get(id)) !== expected) throw Error('Retained forecast changed or missing: ' + id);
const containsOriginalPrefix = (rows, expected) => Array.isArray(rows) && (rows.some((_, i) => jsonHash(rows.slice(0, i + 1)) === expected) || jsonHash([]) === expected);
if (jsonHash(bundle.evaluation) !== baseline.evaluation) throw Error('Previous evaluation changed.');
for (const key of ['collectionLogs', 'actions']) if (!containsOriginalPrefix(bundle[key], baseline[key])) throw Error('Original ledger missing: ' + key);
if (jsonHash((bundle.updates ?? []).slice(0, baseline.updates.length)) !== jsonHash(baseline.updates)) throw Error('Original update history changed.');
const archiveChecks = [];
for (const [path, expected] of Object.entries(baseline.files)) {
  let archived;
  if (path.startsWith('lib/')) archived = path.replace('lib/', 'lib/archive-v6/');
  else if (['reports/audit_protocol.json', 'reports/model_audit.json', 'reports/model_folds.csv', 'reports/seed_sensitivity.json'].includes(path)) archived = path;
  else archived = 'reports/rebuild52-before/' + path.replaceAll('/', '__');
  const actual = hash(await read(archived));
  if (actual !== expected) throw Error('Preserved v6 artifact mismatch: ' + archived);
  archiveChecks.push({ originalPath: path, preservedPath: archived, sha256: actual });
}
if (audit.method !== baseline.model || audit.engineSHA256 !== hash(await read('lib/archive-v6/news-engine.mjs'))) throw Error('Legacy audit archive engine mismatch.');
for (const [path, expected] of Object.entries(audit.sourceHashes)) if (hash(await read(path.replace('lib/', 'lib/archive-v6/'))) !== expected) throw Error('Legacy audit dependency mismatch: ' + path);
if (numerics.status !== 'PASS' || numerics.design?.syntheticCases !== 10000 || numerics.result?.passedCases !== 10000 || numerics.result?.failedCases !== 0 || numerics.edgeChecks?.some(c => c.status !== 'PASS')) throw Error('Actual 10,000 synthetic-case report is required.');
if (numerics.sourceHashes.module !== hash(await read('lib/news-numerics-v7.mjs')) || numerics.sourceHashes.runner !== hash(await read('scripts/validate_numerics_10000.mjs'))) throw Error('Numeric report does not match current source.');
const ec = bundle.candidate.evidenceCoverage;
if (!ec || ec.assetCount !== 52 || ec.rows?.length !== 52 || ec.fixedNewsQuota !== null || ec.trustProbability !== null) throw Error('Current evidence coverage is required.');
const accepted = bundle.candidate.eventGate.accepted, events = new Map(accepted.map(e => [e.id, e]));
const clusters = new Map();
for (const row of ec.rows) for (const assessment of row.assessments) {
  const event = events.get(assessment.eventId); if (!event) throw Error('Coverage refers to an absent event.');
  const key = eventClusterKey(event), values = clusters.get(key) ?? new Set(); values.add(assessment.classification); clusters.set(key, values);
}
const policyCounts = { uniqueEconomicClusters: ec.globalUniqueEventClusters,
  priceEvidenceCandidateClusters: [...clusters.values()].filter(s => s.has('price_evidence_candidate')).length,
  contextOnlyClusters: [...clusters.values()].filter(s => !s.has('price_evidence_candidate') && s.has('context_only')).length,
  abstainedClusters: [...clusters.values()].filter(s => !s.has('price_evidence_candidate') && !s.has('context_only')).length,
  companyScheduleIssuers: ec.rows.filter(r => r.companyScheduleCount > 0).length,
  issuersWithResearchEstimableEvents: ec.issuersWithResearchEstimableEvents,
  modelResearchEventsUsed: bundle.candidate.assets.reduce((s, a) => s + a.eventsUsed, 0),
  statisticalEligibilityIsSeparateFromExploratorySimulation: true };
const scope = scopeCounts(accepted), engineHash = hash(await read('lib/news-engine.mjs'));
const sourceFiles = ['lib/news-engine.mjs', 'lib/event-evidence-v7.mjs', 'lib/news-numerics-v7.mjs', 'lib/news-collection52.mjs', 'lib/market-data.mjs', 'lib/evidence.mjs', 'lib/news-sources.mjs', 'lib/news-scope.mjs', 'lib/service.mjs'];
const currentSourceHashes = Object.fromEntries(await Promise.all(sourceFiles.map(async p => [p, hash(await read(p))])));
const collector = { source: 'reports/collection52/latest.json', startedAt: collection.startedAt, endedAt: collection.endedAt,
  assets: collection.perAsset.length, assetsWithAttempt: collection.perAsset.filter(a => a.attemptedSources > 0).length,
  sourceCount: collection.sourceCount, recordedResults: collection.results.length,
  attemptedSources: collection.results.filter(r => r.attempts > 0).length,
  httpResponses: collection.results.filter(r => r.httpStatus != null).length,
  successfulSources: collection.successfulSources, failedSources: collection.failedSources, deferredSources: collection.deferredSources,
  unselectedSources: collection.unattemptedSources, disabledSources: collection.disabledSources,
  missingSourceCodes: collection.missingSourceCodes ?? [], newVerifiedEvents: collection.newVerifiedEvents, partial: collection.partial,
  failureReasons: collection.results.reduce((counts, r) => { if (r.reason) counts[r.reason] = (counts[r.reason] ?? 0) + 1; return counts; }, {}),
  sourceReviewComplete: false, sourceAcquisitionIsNotEventVerification: true };
if (collector.assets !== 52 || collector.newVerifiedEvents !== 0) throw Error('Collector report must retain all 52 and separate source fetch from event review.');
const rowStatuses = bundle.candidate.assets.flatMap(a => a.rows).reduce((o, r) => { const key = r.numericStatus ?? 'unreported'; o[key] = (o[key] ?? 0) + 1; return o; }, {});
const validation = { schema: 2, version: pkg.version, model: MODEL_VERSION, verifiedAt: new Date().toISOString(),
  validationMeaning: 'Functional correctness, preservation and finite-model arithmetic only; not predictive skill certification.',
  tests, original, latest, originalId: bundle.original.id, latestId: bundle.candidate.id,
  originalSHA256: originalHash, inputSHA256: jsonHash(bundle.input), engineSHA256: engineHash, currentSourceHashes,
  preservation: { passed: true, retainedPriorVersions: Object.keys(baseline.versions).length, evaluationPreserved: true,
    collectionFailureHistoryPreserved: true, updateHistoryPreserved: true, archivedArtifacts: archiveChecks },
  newsByScope: scope, evidenceCoverage: ec, policyCounts,
  numericalValidation: { source: 'reports/numerics-10000.json', sha256: hash(await read('reports/numerics-10000.json')),
    status: numerics.status, syntheticCases: numerics.design.syntheticCases, passedCases: numerics.result.passedCases,
    failedCases: numerics.result.failedCases, edgeChecks: numerics.edgeChecks.length,
    maximumRelativeMeanError: numerics.result.maximumRelativeMeanError, maximumRelativeVarianceError: numerics.result.maximumRelativeVarianceError,
    independentMarketCrossValidations: 0, predictiveAccuracyCertified: false, sameSyntheticSetAsUnitTest: true, rowNumericStatuses: rowStatuses },
  collection: collector,
  legacyModelAudit: { source: 'reports/model_audit.json', model: audit.method, engineSHA256: audit.engineSHA256,
    originalReportPreserved: true, appliesToCurrentModel: false, appliesToCurrentInput: false,
    purpose: audit.purpose, counts: audit.counts, primaryMetrics: audit.primary.metrics, seedSensitivity: sensitivity.summary },
  currentModelAudit: { status: 'NOT_INDEPENDENTLY_VALIDATED', independentMarketCrossValidations: 0, predictiveSkillVerified: false, trustProbability: null },
  auditMatchesCurrentInput: false, predictiveSkillVerified: false, trustProbability: null,
  limitations: { fixedArticleQuota: null, publicationSurpriseInputsComplete: false, independentPriceProviders: 1,
    pointInTimeVintage: false, corporateActionAdjustmentsVerified: false, prospectivePerformanceVerified: false,
    hostedNetlifyDeploymentVerified: false, pixelBrowserVerified: false } };
const coverage = { schema: 2, status: 'evidence_classified_prediction_abstained', byScope: scope,
  uniqueFutureEventRecords: accepted.length, fixedNewsQuota: null, policyCounts, trustProbability: null,
  collection: collector, evidenceCoverage: ec,
  assets: bundle.candidate.assets.map(a => ({ code: a.code, name: a.name, byScope: scopeCounts(a.news),
    eventsUsedInExploratoryModel: a.eventsUsed, held: a.news.filter(n => !n.used).map(n => ({ id: n.id, reason: n.reason })),
    evidence: a.evidence, policy: ec.rows.find(r => r.code === a.code) })) };
await write('reports/validation.json', validation);
await write('reports/news_coverage.json', coverage);
await write('public/downloads/news_coverage.json', coverage);
await write('public/downloads/validation.json', validation);
await write('reports/rebuild52-preservation-after.json', validation.preservation);
// Keep the old report and metrics intact, while making applicability explicit for consumers.
bundle.checks = latest;
bundle.modelAuditApplicability = { legacyModel: audit.method, currentModel: MODEL_VERSION, appliesToCurrentModel: false,
  appliesToCurrentInput: false, independentCurrentModelMarketValidations: 0, trustProbability: null };
bundle.currentModelValidation = { model: MODEL_VERSION, tests, syntheticCases: numerics.design.syntheticCases,
  predictiveSkillVerified: false, trustProbability: null };
await write('public/data/atlas.json', JSON.stringify(bundle));
const pct = value => (value * 100).toFixed(4), n = value => Number(value).toLocaleString('en-US');
const md = `# ATLAS ${pkg.version} 검증 결과\n\n${validation.verifiedAt} · ${MODEL_VERSION}\n\n**새 v7의 실제 시장 예측 우위는 아직 검증되지 않았습니다. 방향 판단은 유보하고 신뢰 확률은 null로 유지합니다.** 기능 검사와 수학 계산의 정확성을 실제 주가 적중률로 표시하지 않습니다.\n\n## 현재 실행과 보존 결과\n\n| 항목 | 실제 결과 |\n|---|---|\n| 기능·회귀 검사 | ${tests.passed}개 통과 / ${tests.failed}개 실패 / ${tests.skipped}개 건너뜀 |\n| 합성 수치 입력 | ${n(numerics.design.syntheticCases)}개 중 ${n(numerics.result.passedCases)}개 통과 / ${numerics.result.failedCases}개 실패 |\n| 추가 수치 극값 검사 | ${numerics.edgeChecks.length}개 통과 |\n| 새 v7 독립 시장 검증 | 0회 |\n| 대상·기간 | 원래 52종목 · 2026-09-17~2026-10-30 |\n| 최신 공통 종가 기준 | ${bundle.candidate.origin} |\n| 새 계산 | ${bundle.candidate.id} · ${latest.actualRows}행 |\n| 최초 전망 | ${bundle.original.id} · SHA256 불변 |\n| 이전 전망 보존 | ${Object.keys(baseline.versions).length}개 해시 일치 |\n| 보관된 파일 | ${archiveChecks.length}개 SHA256 일치 |\n\n합성 10,000개는 1~4일의 작은 유한 분포를 모든 경로 직접 열거값과 비교한 수치 검사입니다. 단위 검사와 같은 입력 집합을 별도 보고서로 실행한 결과이므로 독립 증거를 두 번으로 세지 않습니다. 최대 상대 평균 오차 ${numerics.result.maximumRelativeMeanError}, 최대 상대 분산 오차 ${numerics.result.maximumRelativeVarianceError}. 선택된 모형의 평균·분산은 적률로 계산하고, 첫 거래일의 분위수·상승 비중은 가중 분포를 직접 합산하고 이후 날짜는 몬테카를로로 근사합니다. 계산 정밀도는 미래 예측 정확도와 다릅니다.\n\n## 뉴스 수량과 계산 자격\n\n종목별 기사 할당량을 두지 않습니다. 재게시와 동일 경제 사건은 묶고, 공식 일정·경제적 영향 후보·설명용 일정·과거 표본 자격을 나눕니다.\n\n| 항목 | 수 |\n|---|---:|\n| 현재 전망에 연결된 사건 단계 | ${accepted.length} |\n| 시장 / 지수 / 업종 / 기업 기록 | ${scope.market} / ${scope.index} / ${scope.sector} / ${scope.company} |\n| 중복 제거 경제 사건 묶음 | ${policyCounts.uniqueEconomicClusters} |\n| 가격 영향 검토 후보 묶음 | ${policyCounts.priceEvidenceCandidateClusters} |\n| 설명용 일정 묶음 | ${policyCounts.contextOnlyClusters} |\n| 보류 묶음 | ${policyCounts.abstainedClusters} |\n| 기업 일정이 연결된 종목 | ${policyCounts.companyScheduleIssuers}/52 |\n| 정밀도 정책의 연구 추정 요건 충족 종목 | ${policyCounts.issuersWithResearchEstimableEvents}/52 |\n\n가격 영향 검토 후보도 상승 방향·폭이 확인됐다는 뜻이 아닙니다. 기존의 탐색용 최소 표본 계산과 엄격한 통계 자격은 별개로 기록합니다. 현재 NAVER 단일 가격 원천, 당시 원본 빈티지, 기업행위 조정, 발표 결과와 시장 예상 대비 차이의 부족을 숨기지 않습니다. 상세 종목별 값은 news_coverage.json의 52행에 보존했습니다.\n\n## 실제 수집 결과\n\n${collector.assetsWithAttempt}/52종목에 최소 한 출처 요청 시도를 기록했습니다. ${collector.sourceCount}개 URL 중 요청 시도 ${collector.attemptedSources}개, HTTP 응답 ${collector.httpResponses}개, 정상 원문 확보 ${collector.successfulSources}개, 실패 ${collector.failedSources}개, 회로 차단·제한시간 유보 ${collector.deferredSources}개, 예산 미선택 ${collector.unselectedSources}개입니다. 부분 실패 여부는 ${collector.partial}입니다. 새 원문 확정 사건은 ${collector.newVerifiedEvents}개이며, HTTP 수집은 사건 승인 절차가 아닙니다.\n\n실패 사유: ${JSON.stringify(collector.failureReasons)}. 수집 실패를 뉴스 부재나 52개 원문 검증 완료로 바꾸지 않았습니다. 마지막 정상 자료와 실패 이력은 보존합니다. 회사별 웹 조사 결과는 별도 원문 확인 보고서와 구분합니다.\n\n## 이전 v6 성적은 그대로 보존\n\n이전 감사의 엔진은 ${audit.method}입니다. 해당 SHA256과 의존 파일은 lib/archive-v6에서, 규칙·원 결과·감사·시드 민감도는 기존 보고서에서 대조했습니다. **아래 값은 새 v7 또는 새 입력의 검증 결과가 아닙니다.**\n\n- 과거 ${audit.counts.origins}기준일, ${n(audit.counts.forecastRows)}개 종목·목표일; 비중복 ${audit.counts.nonoverlapOrigins}기간.\n- 27거래일 가격 오차: 이전 모형 ${pct(audit.primary.metrics.modelError)}%, 가격 유지 ${pct(audit.primary.metrics.flatError)}%.\n- Brier: ${audit.primary.metrics.brier.toFixed(7)}, 항상 50% 기준 0.25.\n- 과거 민감도 ${sensitivity.runs}회 및 지표별 부트스트랩 ${n(audit.counts.bootstrapReplicationsPerMetric)}회는 독립 시장 검증 횟수가 아닙니다.\n\n이전 성적의 우위 미입증 결론을 유지합니다. 이전 감사 파일을 새 모형에 맞춰 다시 쓰거나 입력이 바뀌었는데 과거 감사가 새 입력을 인증한 것으로 표시하지 않았습니다.\n\n## 수정 기록과 재현\n\n기존 AUDIT_REPAIRS.md 내용을 보존하고 v7 자료 복원·잘못된 가격 응답·수집 실패·수치 극값·뉴스 자격 검토 내용을 뒤에 추가했습니다. 실제 재현은 reports/rebuild52-audit-review.md와 tests.tap에서 확인합니다.\n\n- npm test > reports/tests.tap 2>&1\n- node scripts/validate_numerics_10000.mjs\n- node scripts/write_reports.mjs\n- npm run build\n- node scripts/package_release.mjs /mnt/data/ATLAS_Netlify.zip\n\nZIP 압축 무결성과 실제 사이트 배포는 별도입니다. 이 보고서는 실제 Netlify 배포·사용자 다운로드·브라우저 픽셀 배치를 완료했다고 주장하지 않습니다.\n\n최초 SHA256: ${originalHash}\n현재 엔진 SHA256: ${engineHash}\n현재 입력 SHA256: ${validation.inputSHA256}\n`;
await write('VALIDATION.md', md); await write('public/downloads/VALIDATION.md', md);
const marker = '<!-- ATLAS_V7_REBUILD_AUDIT_APPEND -->';
for (const path of ['reports/AUDIT_REPAIRS.md', 'public/downloads/AUDIT_REPAIRS.md']) {
  const previous = await read(path);
  // Append once. Re-running reports does not erase or rewrite prior repair evidence.
  if (!previous.includes(marker)) await write(path, previous + `\n\n${marker}\n\n# ATLAS v7 재작성 추가 검토\n\n${validation.verifiedAt}\n\n기존 v6 수정 기록과 성적은 위에 원문 그대로 보존했습니다. 다음은 새 v7의 검토 기록이며, 독립 시장 예측 우위 인증이 아닙니다. 최종 기능 검사·수치 검사·수집 실적은 VALIDATION.md와 validation.json이 기준입니다.\n\n` + auditReview + '\n');
}
console.log(JSON.stringify({ model: MODEL_VERSION, tests: { passed: tests.passed, failed: tests.failed },
  syntheticCases: numerics.design.syntheticCases, preserved: true, assets: 52, rows: latest.actualRows,
  policyCounts, sourceCollectionPartial: collector.partial, currentModelIndependentMarketValidations: 0, trustProbability: null }));

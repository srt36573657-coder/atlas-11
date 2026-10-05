// Current presentation release; historical reports and sealed forecasts stay immutable.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {verifyStudySeal} from '../lib/sealed-manifest.mjs';
const read=p=>fs.readFileSync(p,'utf8'),sha=x=>createHash('sha256').update(x).digest('hex');
const b=JSON.parse(read('public/data/atlas.json')),base=JSON.parse(read('reports/single-view/preservation-before.json'));
const release=process.argv.includes('--release');
const historical=JSON.parse(read('reports/sealed-study/before/public/data/atlas.json'));
const oldVersions=new Map([historical.original,...historical.priorVersions,historical.candidate].map(v=>[v.id,sha(JSON.stringify(v))]));
const versions=new Map([b.original,...b.priorVersions,b.candidate].map(v=>[v.id,sha(JSON.stringify(v))]));
for(const[id,h]of oldVersions)if(versions.get(id)!==h)throw Error('Original forecast changed: '+id);
if(b.input.assets.length!==52||new Set(b.input.assets.map(a=>a.code)).size!==52)throw Error('Universe changed');
for(const[p,h]of Object.entries(base.libs))if(sha(fs.readFileSync(p))!==h)throw Error('Calculation module changed: '+p);
// Preserve original records even if later actual benchmark observations are appended.
const studies=b.sealedStudy?.studies??[];
if(!studies.length||studies.some(s=>!verifyStudySeal(s).valid))throw Error('Historical study seal invalid');
const tap=read('reports/tests.tap'),count=k=>Number(tap.match(new RegExp('# '+k+' (\\d+)(?:\\s|$)'))?.[1]);
if(!count('tests')||count('fail')!==0||count('pass')!==count('tests'))throw Error('Final tests not passing');
const stress=JSON.parse(read('reports/sealed-study/stress.json'));
if(stress.status!=='PASSED'||stress.codeHashes['../lib/paired-score.mjs']!==sha(fs.readFileSync('lib/paired-score.mjs')))throw Error('Stored numerical validation does not match code');
const study=studies.at(-1);
const report={version:'8.6.1',at:new Date().toISOString(),feature:'SINGLE_FORECAST_VIEW',assets:52,
 maximumVisibleForecastPathsPerChart:1,missingForecastDrawsNoPath:true,actualIsSeparateObservation:true,defaultScoreView:'SELECTED_OPERATING_FORECAST',
 historicalStudyLocation:'settings_records_collapsed',forecastEngineChanged:false,existingLibsUnchanged:true,
 originalSHA:sha(JSON.stringify(b.original)),priorForecastsPreserved:oldVersions.size,
 dataSHA256:sha(read('public/data/atlas.json')),wholeDataUnchanged:base.dataSHA256===sha(read('public/data/atlas.json')),
 actualAsOf:b.input.actualAsOf,tests:count('tests'),passed:count('pass'),failed:count('fail'),
 historicalNumericalCases:stress.completedCases,numericalCasesRerun:false,accuracyCertification:false,
 archivedStudyId:study.id,archivedBEstimated:study.validBRecords,benchmarkRows:b.atlasBenchmark?.prices?.length??0,
 benchmarkStatus:b.atlasBenchmark?.status??'NOT_COLLECTED',externalTimestampProofs:b.sealedStudy?.proofs?.length??0,
 liveDeployment:false,pixelBrowserVerified:false,physicalDeviceVerified:false};
fs.mkdirSync('reports/single-view',{recursive:true});
fs.writeFileSync('reports/single-view/validation.json',JSON.stringify(report,null,2));
if(release)fs.writeFileSync('reports/single-view/release-validation.json',JSON.stringify(report,null,2));
fs.writeFileSync('public/downloads/ATLAS_Single_View_Validation.json',JSON.stringify(report,null,2));
fs.writeFileSync('public/downloads/ATLAS_Sealed_Reports.json',JSON.stringify(b.sealedStudy.reports.filter(r=>r.studyId===study.id)));
const body=`# ATLAS 8.6.1 — 예측 하나, 실제와 비교\n\n종목·성적·진화에서 현재 선택한 저장 전망을 기준으로 확인합니다. 차트 한 개에는 예측선 하나와 실제 종가만 표시합니다. 과거 예측안을 평균하거나 새 수치로 만들지 않았습니다.\n\n- 성적의 운영/봉인 두 선택탭을 없앴습니다. 이전 봉인시험은 설정·자료의 접힌 기록에 보존합니다.\n- 예측 선택과 성적 대상이 일치합니다. 다른 저장 전망을 볼 때는 표시한 이름과 날짜로 구분하며 여러 예측을 겹치지 않습니다.\n- 원본 17개 전망과 52종목, 9/17~10/30 범위를 보존합니다. 계산식·저장 전망을 변경하지 않은 화면 수정입니다.\n- 이전 비교시험의 A는 예측이 아닌 참고 숫자로만 남깁니다. B가 없는 종목은 빈 경로이며, 기준가를 예측처럼 그리지 않습니다.\n- 보고서·봉인 지문·원문·수정 전 기록을 보존합니다. 사후 재구성을 9/17 당시 발행 증거로 표시하지 않습니다.\n\n## 실제 확인\n최종 자동 검사 ${report.tests}개 통과, 실패 ${report.failed}개. 이전 10억 합성 수치 검사는 계산 코드가 그대로인 것을 확인해 재사용했으며 이번에 다시 실행한 것처럼 세지 않습니다. 예측 적중률 인증이 아닙니다. 보관 공통 종가는 ${report.actualAsOf}입니다.\n\n## 자료와 외부 연결\n현재 코스피 보관 행 ${report.benchmarkRows}개, 수집 상태 ${report.benchmarkStatus}. 원문과 관측 시각은 저장 자료에 기록합니다. 수집 실패 이력은 삭제하지 않습니다. 이전 비교시험 B 수치 확보 ${report.archivedBEstimated}/52종목이며 운영전망과는 별개의 과거 연구 기록입니다. 외부 인증 증거 ${report.externalTimestampProofs}개입니다.\n\n실제 사이트 배포·서버 자동수집 설치·휴대폰 실기 검수는 완료하지 않았습니다. 공개 원문 수집 및 외부 시각 인증의 이번 실제 시도 결과는 reports/single-view에 보존합니다.\n\n## 사용과 배포\nATLAS_Evolution_Netlify.zip의 압축을 풀고 index.html이 바로 있는 폴더를 Netlify 수동 배포에 올립니다. 같은 데이터와 전체 소스는 ATLAS_Netlify.zip에 보존합니다. 정적 파일 업로드만으로 서버 수집·로그인 설정이 생기지는 않습니다.\n`;
fs.writeFileSync('public/downloads/ATLAS_SINGLE_VIEW.md',body);
fs.writeFileSync('public/downloads/ATLAS_Sealed_Guide.md',body+'\n이전 비교시험의 계산 정책과 봉인 기록은 ATLAS_Sealed_Study.json에 보존합니다.\n');
for(const file of ['README.md','VALIDATION.md']){const old=read(file),mark='\n<!-- SINGLE861_HISTORY -->\n',history=old.includes(mark)?old.split(mark).slice(1).join(mark):old;fs.writeFileSync(file,body+mark+history);}
console.log(JSON.stringify(report));

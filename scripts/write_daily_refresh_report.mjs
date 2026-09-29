import fs from 'node:fs';
import path from 'node:path';
import {verifyDailyFiles,verifyDailyTests} from './verify_daily_refresh.mjs';
import {scopeCounts,scopeOf,appliesTo} from '../lib/news-scope.mjs';
const {bundle:b,before,verification}=verifyDailyFiles(),meta=b.dailyRefresh,log=b.collectionLogs.at(-1)??{};
const events=b.candidate.eventGate.accepted;
const own=events.filter(e=>['company','sector'].includes(scopeOf(e).type));
const missing=b.input.assets.filter(a=>!own.some(e=>appliesTo(e,a))).map(({code,name})=>({code,name}));
const items=log.items??[];
const report={schemaVersion:1,type:'daily_input_refresh',runId:meta.runId,at:new Date().toISOString(),...verification,
 tests:verifyDailyTests(),period:{start:b.input.origin,end:b.input.end},actualAsOf:b.input.actualAsOf,
 modelVersion:b.candidate.modelVersion,forecastRows:b.candidate.rowCount,scopeCounts:scopeCounts(events),
 scopeBasis:'current saved forecast accepted event stages, not article counts',scheduleLinkedStocks:52-missing.length,companySchedulesRemaining:missing,
 collection:{at:log.at,exitCode:log.exitCode??meta.refreshExitCode,partial:log.partial===true,marketClosed:log.marketClosed===true,
  priceRequests:items.filter(x=>!x.cached).length,fetchedCloses:items.filter(x=>x.ok&&!x.cached).length,cachedCloses:items.filter(x=>x.cached).length,
  provider:'NAVER single provider',macro:log.news??null,company:log.companyNews??null,cycle:log.cycle??null},
 researchReportPath:meta.researchReportPath??null,
 evaluationRecords:b.evaluationLedger.length,prospectiveRecords:b.evaluationLedger.filter(r=>r.evaluationKind==='PROSPECTIVE').length,
 historicalInstallationCheck:'Preserved immutable v8 installation snapshot; not reused to certify current inputs.',
 historicalAudits:'Preserved; no new independent predictive audit performed.',deployed:false,visualBrowserVerified:false};
const dir=path.dirname(meta.preservationPath);
for(const p of [path.join(dir,'validation.json'),'reports/validation.json','public/downloads/DAILY_REFRESH_VALIDATION.json'])fs.writeFileSync(p,JSON.stringify(report,null,2)+'\n');
const md=`# ATLAS 일일 갱신 결과\n\n${report.at}\n\n기간 ${b.input.origin}~${b.input.end}, ${report.assets}종목, ${report.modelVersion} 유지.\n\n- 보관 종가 기준일: ${report.actualAsOf}. 휴장 표시: ${report.collection.marketClosed}. 새 종가 수집 ${report.collection.fetchedCloses}종목, 보관 종가 사용 ${report.collection.cachedCloses}종목.\n- 수집 종료 코드 ${report.collection.exitCode}, 부분 실패 ${report.collection.partial}. 회사 URL 요청 결과와 뉴스 원문 검증은 별개이며 자세한 결과는 JSON 보고서에 보존했습니다.\n- 전망: ${report.newForecast?'새 전망 추가':'기존 전망 유지'} (${report.candidateId}). 이전 ${report.priorForecastsPreserved}개 고유 전망과 최초 원본을 보존했습니다.\n- 현재 전망 사건 단계: 시장 ${report.scopeCounts.market}, 지수 ${report.scopeCounts.index}, 업종 ${report.scopeCounts.sector}, 기업 ${report.scopeCounts.company}. 기업·업종 일정 연결 ${report.scheduleLinkedStocks}종목. 미확보 ${missing.length}종목: ${missing.map(a=>a.name).join(', ')}.\n- 기능 검사 ${report.tests.passed}개 통과, 실패 ${report.tests.failed}. 원본·이전 전망·수정 및 실패 기록·계산 코드 보존을 검사했습니다. 이전 설치 및 과거 감사 기록을 새 입력의 정확도 인증으로 사용하지 않았습니다.\n- 실전 적중 확률과 독립 예측 우위는 미인증입니다. 실제 사이트 배포와 브라우저 픽셀 검사는 수행하지 않았습니다.\n\n최초 원본 JSON.stringify SHA256: ${report.originalSHA256}\n`;
for(const p of [path.join(dir,'DAILY_REFRESH.md'),'public/downloads/DAILY_REFRESH.md'])fs.writeFileSync(p,md);
console.log(JSON.stringify({...report,collection:{...report.collection,macro:undefined,company:undefined,cycle:undefined}}));

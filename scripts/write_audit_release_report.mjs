import fs from 'node:fs';
import {verifyAuditFiles,verifyAuditTests,releaseDirectory} from './verify_audit_release.mjs';
const {bundle:b,verification}=verifyAuditFiles();
const report={schemaVersion:1,type:'code_audit_repair_release',at:new Date().toISOString(),...verification,tests:verifyAuditTests(),
 informationCutoff:b.candidate.informationCutoff,createdAt:b.candidate.createdAt,newMarketDataCollected:false,
 collectionStatus:b.collectionLogs.at(-1)??null,prospectiveRecords:(b.evaluationLedger??[]).filter(r=>r.evaluationKind==='PROSPECTIVE').length,
 inheritedResearchLimitations:'기존 미확보 일정·단일 가격 제공자·기업행위 조정 미확인 상태 유지',deployed:false,visualBrowserVerified:false,
 historicalAudits:'기존 감사·일일 수집·8.0 설치 검사는 보관한 당시 버전의 기록이며 8.0.1 정확도 인증이 아니다.'};
for(const p of [releaseDirectory+'/validation.json','reports/validation.json','public/downloads/AUDIT_RELEASE_VALIDATION.json'])fs.writeFileSync(p,JSON.stringify(report,null,2));
const md=`# ATLAS 8.0.1 계산 감사 수정 배포본\n\n- 새 전망 ${report.candidateId}; 52종목·9/17~10/30.\n- 기존16개 전망과 최초 원본, 가격·뉴스 입력, 평가장부, 수집·실패 기록을 보존했습니다.\n- 새 자료 수집이 아니라 같은 입력·기준시각·고정 시드로 수정 계산을 적용한 별도 전망입니다.\n- 기능 검사 ${report.tests.passed}개 통과. 독립 실전 예측력 검증이 아닙니다.\n- 이전 연구·회사 일정 미확보와 가격 조정 미검증 상태는 그대로입니다.\n- 실제 Netlify 배포 및 픽셀 브라우저 검사는 수행하지 않았습니다.\n\n원본 SHA256: ${report.originalSHA256}\n`;
for(const p of [releaseDirectory+'/AUDIT_RELEASE.md','public/downloads/AUDIT_RELEASE.md'])fs.writeFileSync(p,md);
console.log(JSON.stringify({...verification,tests:report.tests}));

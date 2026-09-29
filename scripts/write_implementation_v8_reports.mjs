import fs from 'node:fs';
import {verifyImplementation,verifyImplementationTests} from './verify_implementation_v8.mjs';
import {scopeCounts} from '../lib/news-scope.mjs';
const b=JSON.parse(fs.readFileSync('public/data/atlas.json'));
const report={...verifyImplementation(),tests:verifyImplementationTests(),at:new Date().toISOString(),scopeCounts:scopeCounts(b.candidate.eventGate.accepted),
 companySchedulesRemaining:7,newNewsVerified:0,liveCollectionPerformed:false,googleConfigurationVerified:false,
 deployed:false,visualBrowserVerified:false,uiVerified:'built JavaScript DOM interaction tests; browser preview blocked by environment policy',
 openEvidence:['공식 지수·업종 10년 일별 원자료','FOMO 18항목 중 12항목','발표 직전 예상과 실제 결과','기업행위 조정 및 당시 가격 빈티지','독립 실전 예측력','7종목 확정 기업 일정']};
for(const p of ['reports/implementation-8.0/validation.json','public/downloads/IMPLEMENTATION_8_VALIDATION.json'])fs.writeFileSync(p,JSON.stringify(report,null,2)+'\n');
const md=`# ATLAS 8.0 실제 구현·검증 결과\n\n${report.at}\n\n52종목 · 2026-09-17~2026-10-30 고정. 새 전망 ${report.candidateId}, ${report.forecastRows}행, 종목당 ${report.paths.toLocaleString()}경로. 실제 종가 기준일은 ${report.actualAsOf}입니다.\n\n## 이번에 작동하도록 바꾼 것\n\n- 자기 종목의 5·20·60거래일 수익률 특징으로 조건부 평균을 계산합니다. 9/17 이전 자료로만 계수와 혼합 비중을 정하고 고정합니다. 새 실제 가격은 특징값을 갱신합니다. 뉴스 방향 유보를 종목 전체 변화 0으로 해석하지 않습니다.\n- 52개 전체 전망을 처음부터 표시하고 10/30 모형 중앙값 수익률순으로 정렬합니다. 종목 선택은 클릭 방식이며 검색은 선택 사항입니다. 예측 종합 화면은 삭제했습니다.\n- 카드·좌측 탐색·휴대폰 하단 탐색과 집중 보기. 실제 종가 실선과 전망 점선을 같은 축에 표시합니다. 재생은 거래일당 1초, 중요 뉴스 확인 정지, 다른 종목 전환·보기 닫기 시 정지하면서 날짜·속도를 보존합니다.\n- 뉴스는 선택 종목의 사건 반영/해제 분포 변화순으로 표시합니다. 미산정을 0으로 대체하지 않습니다. 전체 일정 원문·발표 시각은 펼쳐서 확인할 수 있습니다.\n- 고정 전망/실제 비교 기록 ${report.evaluationRecords}개. 전망·종목·날짜별 가격 오차·방향·범위를 따로 확인하고 원인 점검은 확인·추정·미확인을 나눕니다. 결과 전 발행으로 분류한 기록은 ${report.prospectiveRecords}개입니다. 재구성·결과 후 발행을 실전 적중으로 세지 않습니다.\n- Google 공식 토큰 검증, nonce·서명 세션, 계정별 관심종목 저장, 충돌 재시도, 다른 계정 쓰기 거부, 목록 내보내기·비우기 코드가 포함됩니다. 실제 Google 설정과 운영 배포는 아직 연결되지 않았습니다.\n- 기존 한국시간 16:00 시작 수집과 실패 재시도 경로에 평가 기록 누적을 연결했습니다. 입력이 같으면 새 전망을 중복 생성하지 않고 10/30 이후 수집은 진행하지 않습니다. 정적 ZIP만 올리면 자동 수집·계정 서버는 실행되지 않으므로 내부 소스 ZIP의 함수 포함 배포가 필요합니다.\n\n## 검사\n\n전체 기능·회귀 검사 ${report.tests.passed}개 통과, 실패 0. 조건부 평균 직접 적률 대조, 미래 정보 차단, 종목 간 격리, 원본·이전 ${report.priorForecastsPreserved}개 전망 보존, 가격 정정의 추가 기록, 계정 분리·세션·충돌, 완성 빌드의 화면 클릭·재생·날짜별 설명을 검사했습니다. 실제 브라우저 미리보기는 환경 정책으로 차단되어 픽셀 수준 외관 검사는 완료하지 못했습니다. DOM 상호작용 검사를 통과했다는 뜻이며 실제 모바일 화면을 확인했다고 주장하지 않습니다.\n\n최초 JSON.stringify SHA256: ${report.originalSHA256}. 이전 감사·실패 로그는 보존했습니다. 새 입력을 수집한 작업은 아니며 기업 뉴스 추가 확인 0건, 미확인 기업 일정 7종목이 남습니다.\n\n## 근거 한계\n\n새 방정식은 연구용 추정입니다. 과거 내부 구간으로 계수를 선택한 결과를 독립 교차검증이나 실제 적중 확률로 표시하지 않습니다. 36개 수식 개선안이 모두 검증·활성화된 것은 아닙니다. 공식 지수·업종 10년 자료와 FOMO 누락 입력·발표 예상 대비 차이는 확보 전까지 가격 보정에 추가하지 않습니다. 뉴스 개수나 경로 수가 늘어도 검증 완료가 되지 않습니다. NAVER 단일 제공자, 기업행위 조정·당시 빈티지 미확보가 남습니다.\n\nGoogle 설정은 ACCOUNT_SETUP.md, 실행·배포는 README.md와 DEPLOY.md, 수식은 ATLAS_Stock_Equations.md를 보세요.\n`;
for(const p of ['reports/implementation-8.0/IMPLEMENTATION_8.md','public/downloads/IMPLEMENTATION_8.md'])fs.writeFileSync(p,md);
for(const p of ['VALIDATION.md','public/downloads/VALIDATION.md']){
 const old=fs.readFileSync(p,'utf8');if(!old.includes('<!-- IMPLEMENTATION_8 -->'))fs.writeFileSync(p,'<!-- IMPLEMENTATION_8 -->\n'+md+'\n---\n\n아래는 변경 전 보관 기록입니다.\n\n'+old);
}
for(const p of ['reports/AUDIT_REPAIRS.md','public/downloads/AUDIT_REPAIRS.md']){
 const old=fs.readFileSync(p,'utf8');if(!old.includes('<!-- IMPLEMENTATION_8 -->'))fs.appendFileSync(p,'\n<!-- IMPLEMENTATION_8 -->\n'+md);
}
console.log(JSON.stringify(report));

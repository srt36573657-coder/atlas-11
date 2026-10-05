import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {verifyFreshTests,verifyPrecision} from './verify_precision.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFile(new URL(p,root),'utf8');
const hash=x=>createHash('sha256').update(x).digest('hex');
const before=JSON.parse(await read('reports/smart-7.7/before/preservation.json'));
const protectedSources=JSON.parse(await read('reports/smart-7.7/before/library-sources.json'));
const oldTests=JSON.parse(await read('reports/smart-7.7/before/test-metadata.json'));
const tests=verifyFreshTests(),precision=verifyPrecision();
assert.equal(tests.passed,202);
const bundle=JSON.parse(await read('public/data/atlas.json'));
assert.deepEqual(bundle.currentModelValidation.tests,{...oldTests,total:202,passed:202,sha256:tests.sha256});
const reverted=structuredClone(bundle);reverted.currentModelValidation.tests=oldTests;
assert.equal(hash(JSON.stringify(reverted)),before['public/data/atlas.json'],'Only current test receipt may change');
for(const [file,expected] of Object.entries({...before,...protectedSources})){
 if(file==='public/data/atlas.json')continue;
 assert.equal(hash(await fs.readFile(new URL(file,root))),expected,'Protected input/model/history changed: '+file);
}
const versions=new Map([bundle.original,...bundle.priorVersions,bundle.candidate].map(v=>[v.id,hash(JSON.stringify(v))]));
const versionHashes=JSON.parse(await read('reports/smart-7.7/before/forecasts.json'));
assert.deepEqual(Object.fromEntries(versions),versionHashes);
const result={appVersion:'7.7.0',checkedAt:new Date().toISOString(),libraryBaseVersion:23,
 tests,preservedForecasts:versions.size,candidateId:bundle.candidate.id,paths:bundle.candidate.paths,
 originalSHA256:hash(JSON.stringify(bundle.original)),protectedSourceFiles:Object.keys(protectedSources).length,
 dataChanges:'currentModelValidation.tests total, passed, sha256 only',
 engineChanged:false,pricesChanged:false,newsAdded:0,pixelBrowserVerified:false,netlifyDeployed:false,
 features:['per-stock evidence-date shortcuts','local watchlist with storage-failure notice','scope-aware filters','important news first','collapsed supplemental research'],
 precisionCheck:precision,allNewsComplete:false,remainingNewsCompanies:7};
const md=`# ATLAS 7.7 — 핵심 날짜와 설명 중심 화면\n\n${result.checkedAt}\n\n## 적용\n\n- 전체 52종목 / 관심종목 / 기업·업종 일정 / 수치 반영 일정 필터와 검색을 함께 사용합니다. 종목 순서는 기존 순서이며 매수 순위를 만들지 않습니다. ‘수치 반영’에는 방향 0의 변동 분포 반영이 포함됩니다.\n- ☆ 관심을 누른 목록은 브라우저의 별도 키 atlas-watchlist-v1에 보관합니다. 손상·접근 제한·용량 오류를 처리하며 저장 실패는 화면에 표시합니다. 기존 운영 저장소 이름과 예측 기록은 변경하지 않습니다.\n- 각 종목의 다음 연결 일정, 미래 모형 중앙값의 하루 변화 절댓값 최대일, P90−P10 가격 폭 최대일을 클릭하면 해당 종목·날짜의 그래프와 이유가 열립니다.\n- 중요한 뉴스에서 정지하면 설명을 오른쪽 맨 위에 표시합니다. 날짜가 바뀌면 설명 스크롤도 맨 위로 돌아갑니다.\n- 날짜별 이유를 먼저 읽고 FOMO·주기·신문 연구자료는 펼쳐서 읽습니다. 44개 날짜 칸과 1초 독립 재생, 확인 후 계속, 전체 기간 표시를 유지합니다.\n- 와인색·아이보리·금색 체계를 유지하고 여백·버튼·정보 순서를 정돈했습니다. 외부 디자인 자원을 추가하지 않았습니다.\n\n## 탐색 계산식\n\n다음 일정 = min{d > 선택일 : 해당 종목의 연결 사건이 있는 d}.\n\n중앙값 변화 최대일 = argmax_d |M_d / M_previous_session − 1|. 실제 종가·휴장일·출발점은 제외하고 저장된 미래 모형의 값을 읽습니다.\n\n범위 최대일 = argmax_d (P90_d − P10_d). 같은 종목의 원화 가격 폭이며 유효한 순서의 양수 분위수만 사용합니다.\n\n동률은 이른 날짜를 선택합니다. 변화가 0이거나 자료가 없으면 날짜를 꾸며내지 않고 버튼을 비활성화합니다. 개별 뉴스의 인과 기여도, 적중 확률 또는 추천 매수일로 표시하지 않습니다.\n\n## 실제 검사\n\n기능 검사 ${tests.passed}개 통과. 새 검사에는 실제/휴장일 제외, 동률, 평평한 경로, 잘못된 값, 회사 간 뉴스 혼입 방지, 검색과 필터 결합, 관심 목록 저장 실패가 포함됩니다. 화면 검사에서는 관심 목록 추가/삭제·필터·빈 화면 복구·날짜 바로가기·다른 종목 상태 유지·중요 뉴스 최상단 표시를 검사했습니다.\n\n현재 소스 전체 해시와 테스트 시작 시 소스 해시가 일치합니다. 7.6의 20,000경로 계산 및 최초 원본 포함 ${versions.size}개 보관 전망을 그대로 보존했습니다. atlas.json은 최신 검사 영수증의 총수·통과수·SHA256만 갱신합니다.\n\n실제 브라우저 픽셀 확인은 기존 로컬 미리보기 접근 제한으로 수행하지 못했습니다. JSDOM 구조·조작 검사는 픽셀 검사를 대신한 완료 주장이 아닙니다. 예측 정확도 개선을 검증하거나 실제 Netlify 사이트에 배포한 작업이 아닙니다.\n\n미확인 7종목 뉴스와 WorkGuard의 뉴스 미완료 상태는 그대로입니다. 이번 화면 개선을 전체 뉴스 확보 완료로 표시하지 않습니다. 이전 검사와 보고서는 reports/smart-7.7/before/에 보존했습니다.\n`;
await fs.writeFile(new URL('reports/smart-7.7/result.json',root),JSON.stringify(result,null,2)+'\n');
for(const file of ['reports/smart-7.7/README.md','public/downloads/SMART_VIEW_7_7.md'])await fs.writeFile(new URL(file,root),md);
for(const file of ['VALIDATION.md','public/downloads/VALIDATION.md','reports/AUDIT_REPAIRS.md','public/downloads/AUDIT_REPAIRS.md']){
 const old=await read(file);if(!old.includes('<!-- SMART_7_7 -->'))await fs.writeFile(new URL(file,root),old+'\n<!-- SMART_7_7 -->\n'+md);
}
console.log(JSON.stringify(result));

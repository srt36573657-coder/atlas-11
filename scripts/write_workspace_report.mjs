import fs from 'node:fs';import {createHash} from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'),sha=b=>createHash('sha256').update(b).digest('hex');
const base=JSON.parse(read('reports/design-90/before.json'));for(const[p,h]of Object.entries(base))if(sha(fs.readFileSync(p))!==h)throw Error('Protected data/engine changed: '+p);
const raw=read('public/data/atlas.json'),data=JSON.parse(raw),tap=read('reports/tests.tap'),count=k=>Number(tap.match(new RegExp('# '+k+' (\\d+)(?:\\s|$)'))?.[1]);
if(!count('tests')||count('pass')!==count('tests')||count('fail')!==0)throw Error('Final suite not passing');
const browser=JSON.parse(read('reports/design-90/browser.json'));if(!browser.passed)throw Error('Browser validation failed');
const ids=new Set([data.original,...data.priorVersions,data.candidate].map(v=>v.id));const checklist=JSON.parse(read('reports/design-90/checklist-180.json'));
const report={version:'9.0.0',at:new Date().toISOString(),feature:'COMPACT_DARK_WORKSPACE',tests:count('tests'),passed:count('pass'),failed:0,browser:{engine:browser.browser,checks:browser.checks.length,passed:browser.checks.filter(c=>c.pass).length,viewports:browser.viewports.map(v=>[v.width,v.height]),source:browser.root??'development',physicalDevice:false},wholeDataUnchanged:true,originalSHA256:sha(JSON.stringify(data.original)),dataSHA256:sha(raw),priorForecastsPreserved:ids.size,assets:data.input.assets.length,actualAsOf:data.input.actualAsOf,existingCalculationFilesUnchanged:true,accuracyCertification:false,liveDeployment:false,externalTimestampProofs:data.sealedStudy?.proofs?.length??0,checklist:Object.fromEntries([...new Set(checklist.map(x=>x.status))].map(s=>[s,checklist.filter(x=>x.status===s).length])),limitations:['물리 휴대폰·일반 사용자 5명 관찰 미실행','별도 계정의 실제 사이트 배포 미실행','자동 종가 수집·Google 인증 신규 설치 아님','기존 예측 정확도 개선 주장 없음']};
fs.writeFileSync('reports/design-90/validation.json',JSON.stringify(report,null,2));fs.writeFileSync('public/downloads/ATLAS_Workspace_Validation.json',JSON.stringify(report,null,2));
const body=`# ATLAS 9.0.0 — 그래프에 집중하는 작업 화면

상단 메뉴와 자료 상태를 두 줄로 통합했습니다. 큰 소개 제목과 반복 안내를 제거하고, 왼쪽 종목 목록·중앙 그래프·오른쪽 이유를 한 화면에 배치했습니다. 종목명·날짜·가격을 별도 행으로 나눠 겹침을 없앴습니다. 휴대폰은 클릭형 종목 선택과 열고 닫는 설명 패널을 제공합니다. 중요 뉴스는 확인 후 계속합니다.

남색/청록/밝은 글씨의 단일 디자인 체계이며 Noto Sans KR 가변 글꼴을 자체 제공합니다(SIL OFL 라이선스 포함). 기존 테마 직접 import를 정리하고 현재 작업 화면의 레이아웃을 한 파일에서 관리합니다. 무관한 종목·가격·방정식은 수정하지 않았습니다.

## 확인한 결과
- 전체 기능 검사 ${report.tests}개 통과, 실패 0개.
- Chromium ${browser.browser}: ${report.browser.passed}/${report.browser.checks} 화면·조작 검사 통과.
- 노트북 1366×640 / 1280×600에서 그래프·재생 버튼 동시 표시.
- 휴대폰 크기 360/390/430px, 320px 및 확대에 대응하는 좁은 뷰포트 검사.
- 올릭스 10/15 중요 뉴스 정지·설명·계속과 날짜 보존 확인.
- 전체 자료 SHA256 ${report.dataSHA256}; 52종목·${ids.size}개 전망 보존.
- 실제 공통 종가 기준 ${report.actualAsOf}. 새 종가를 수집했다는 뜻이 아닙니다.

## 남은 확인
물리 휴대폰과 사용자 5명 관찰은 하지 않았습니다. 180개 항목을 모두 독립 검증 완료했다고 표시하지 않습니다. 상세 적용/보존/부분 적용/외부 확인 상태는 ATLAS_180_IMPLEMENTATION.md에 있습니다. 실제 사이트 배포와 서버 자동 수집·Google 인증 설정은 별도입니다.

## 배포
ATLAS_Evolution_Netlify.zip 하나를 사용합니다. 압축을 풀어 index.html이 바로 들어 있는 폴더를 Netlify 수동 배포 영역에 올리세요.
`;
fs.writeFileSync('public/downloads/ATLAS_WORKSPACE.md',body);
for(const p of ['README.md','VALIDATION.md']){const old=read(p),mark='\n<!-- WORKSPACE90_HISTORY -->\n';fs.writeFileSync(p,body+mark+(old.includes(mark)?old.split(mark).slice(1).join(mark):old));}
console.log(JSON.stringify(report));

import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'), sha=x=>createHash('sha256').update(x).digest('hex');
const base=JSON.parse(read('reports/design-learning-before.json')), raw=read('public/data/atlas.json'), b=JSON.parse(raw);
if(sha(raw)!==base.rawDataSHA256)throw Error('UI release changed stored data');
for(const [p,h] of Object.entries(base.files))if(p!=='lib/service.mjs'&&sha(fs.readFileSync(p))!==h)throw Error('Existing calculation file changed: '+p);
const versions=new Map([b.original,...b.priorVersions,b.candidate].map(v=>[v.id,sha(JSON.stringify(v))]));
const loading=JSON.parse(read('reports/learned-design/display-size.json'));
for(const [id,h] of Object.entries(base.versions))if(versions.get(id)!==h)throw Error('Forecast changed: '+id);
const tap=read('reports/tests.tap'), count=k=>Number(tap.match(new RegExp('# '+k+' (\\d+)(?:\\s|$)'))?.[1]);
if(!count('tests')||count('fail')!==0||count('pass')!==count('tests'))throw Error('Final TAP is not fully passing');
const report={version:'8.8.0',at:new Date().toISOString(),feature:'STUDIO_WORKSPACE',wholeDataUnchanged:true,
 originalSHA256:sha(JSON.stringify(b.original)),dataSHA256:sha(raw),priorForecastsPreserved:versions.size,
 assets:b.input.assets.length,actualAsOf:b.input.actualAsOf,existingCalculationFilesUnchanged:true,presentationAdapterChanged:"lib/service.mjs",
 tests:count('tests'),passed:count('pass'),failed:count('fail'),accuracyCertification:false,
 initialDisplayBytes:loading.displayBytes,initialDisplayGzipBytes:loading.displayGzipBytes,fullArchiveGzipBytes:loading.previousGzipBytes,
 liveDeployment:false,physicalDeviceVerified:false,externalTimestampProofs:b.sealedStudy?.proofs?.length??0};
fs.mkdirSync('reports/studio',{recursive:true});
fs.writeFileSync('reports/studio/validation.json',JSON.stringify(report,null,2));
fs.writeFileSync('public/downloads/ATLAS_Studio_Validation.json',JSON.stringify(report,null,2));
const body=`# ATLAS 8.8.0 — 한 화면에서 읽는 종목

첫 화면을 52종목 선택판과 선택 종목의 큰 그래프·날짜별 설명으로 재구성했습니다. 딥브라운 탐색 영역과 아이보리 작업 영역을 분리했습니다. 모든 종목의 전체 기간 미니 경로를 목록에 표시하고 전체 그래프 화면도 유지합니다. 종목 선택에는 방향키·Home·End를 사용할 수 있습니다.

## 보존과 검사
기존 52종목·17개 전망·원본 가격 및 계산 모듈을 보존했습니다. 자동 검사 ${report.tests}개 통과, 실패 ${report.failed}개. 자료 SHA: ${report.dataSHA256}. 실제 공통 종가 기준은 ${report.actualAsOf}입니다. 예측 정확도 개선이나 새 가격 수집을 주장하지 않습니다.

## 한계
실제 브라우저 픽셀 및 물리 휴대폰 검수는 미완료입니다. Netlify 실배포·서버 자동수집·구글 인증 설치는 이번 ZIP 제작에 포함되지 않습니다. 외부 시각 인증 ${report.externalTimestampProofs}개.

## 배포
배포용 ZIP을 풀고 index.html이 바로 들어 있는 폴더를 Netlify 수동 배포 영역에 올립니다.
`;
fs.writeFileSync('public/downloads/ATLAS_STUDIO.md',body);
for(const p of ['README.md','VALIDATION.md']){const mark='\n<!-- STUDIO88_HISTORY -->\n',old=read(p);fs.writeFileSync(p,body+mark+(old.includes(mark)?old.split(mark).slice(1).join(mark):old));}
console.log(JSON.stringify(report));

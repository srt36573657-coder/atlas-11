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
const report={version:'8.7.0',at:new Date().toISOString(),feature:'LEARNED_DESIGN',wholeDataUnchanged:true,
 originalSHA256:sha(JSON.stringify(b.original)),dataSHA256:sha(raw),priorForecastsPreserved:versions.size,
 assets:b.input.assets.length,actualAsOf:b.input.actualAsOf,existingCalculationFilesUnchanged:true,presentationAdapterChanged:"lib/service.mjs",
 tests:count('tests'),passed:count('pass'),failed:count('fail'),accuracyCertification:false,
 initialDisplayBytes:loading.displayBytes,initialDisplayGzipBytes:loading.displayGzipBytes,fullArchiveGzipBytes:loading.previousGzipBytes,
 liveDeployment:false,physicalDeviceVerified:false,externalTimestampProofs:b.sealedStudy?.proofs?.length??0};
fs.mkdirSync('reports/learned-design',{recursive:true});
fs.writeFileSync('reports/learned-design/validation.json',JSON.stringify(report,null,2));
fs.writeFileSync('public/downloads/ATLAS_Learned_Design_Validation.json',JSON.stringify(report,null,2));
const body=`# ATLAS 8.7.0 — 종목·날짜·근거가 이어지는 화면\n\n공식 디자인 자료를 학습한 기획에 따라 단일 전망 화면, 성적에서 날짜별 근거로 이동, 읽기 편한 모바일 조작과 색 대비를 개선했습니다. 52종목과 9/17~10/30 전체 기간, 기존 17개 전망을 보존합니다.\n\n## 실제 검증\n최종 자동 검사 ${report.tests}개 통과, 실패 ${report.failed}개. 저장 자료 전체 SHA와 기존 계산 모듈 불변을 확인했습니다. 원본 SHA: ${report.originalSHA256}. 실제 공통 종가 기준은 ${report.actualAsOf}입니다. 새로운 종가 수집이나 예측 정확도 향상을 뜻하지 않습니다.\n\n## 운영과 검수 범위\n실제 Netlify 배포·서버 자동수집 연결·Google 계정 동기화·물리 휴대폰 검수는 완료되지 않았습니다. 정적 ZIP은 화면 배포용이며 서버 설치를 대신하지 않습니다. 조사 기획의 사용자 10명 검사는 아직 수행하지 않았습니다. 외부 시각 인증 ${report.externalTimestampProofs}개.\n\n## 사용\n성적에서 종목을 선택하면 해당 날짜의 그래프와 근거로 이동합니다. 선택 전망은 점선 하나, 실제는 실선입니다. 종목·날짜 상태를 보존하며 중요 뉴스는 확인 후 계속합니다. 상세 설계와 조사 근거는 ATLAS_Design_Learning_Plan.html에 있습니다.\n\n## 배포\n배포용 ZIP은 압축을 풀고 index.html이 바로 있는 폴더를 Netlify 수동 배포 영역에 올립니다. 전체 소스·보관 기록 ZIP과 정적 배포 ZIP의 역할은 다릅니다. 배포·연결 상태는 실제 성공 기록으로 확인하세요.\n`;
fs.writeFileSync('public/downloads/ATLAS_LEARNED_DESIGN.md',body);
for(const p of ['README.md','VALIDATION.md']){const mark='\n<!-- LEARNED87_HISTORY -->\n',old=read(p);fs.writeFileSync(p,body+mark+(old.includes(mark)?old.split(mark).slice(1).join(mark):old));}
console.log(JSON.stringify(report));

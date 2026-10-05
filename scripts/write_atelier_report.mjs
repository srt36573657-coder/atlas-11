// Presentation release report. Historical release checks are opt-in; daily inputs may advance.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'),hash=x=>createHash('sha256').update(x).digest('hex');
const bundle=JSON.parse(read('public/data/atlas.json'));
const before=JSON.parse(read('reports/atelier/preservation-before.json'));
const release=process.argv.includes('--release');
const unique=new Map();
for(const v of [bundle.original,...bundle.priorVersions,bundle.candidate]){
 const h=hash(JSON.stringify(v));if(unique.has(v.id)&&unique.get(v.id)!==h)throw Error('상충 전망 ID: '+v.id);unique.set(v.id,h);
}
for(const[id,h]of Object.entries(before.versions))if(unique.get(id)!==h)throw Error('발행 전망 변경: '+id);
if(release){
 if(hash(fs.readFileSync('public/data/atlas.json'))!==before.bundleFileSHA)throw Error('디자인 릴리스 입력 변경');
 for(const[k,h]of Object.entries(before.bundleFields))if(hash(JSON.stringify(bundle[k]))!==h)throw Error('디자인 릴리스 기존 필드 변경: '+k);
 for(const[p,h]of Object.entries(before.libFiles))if(hash(fs.readFileSync(p))!==h)throw Error('디자인 릴리스 엔진 변경: '+p);
}
const tap=read('reports/tests.tap'),get=k=>Number(tap.match(new RegExp('# '+k+' (\\d+)(?:\\s|$)'))?.[1]);
if(get('fail')!==0||!get('tests')||get('pass')!==get('tests'))throw Error('최종 자동 검사 미완료');
const report={at:new Date().toISOString(),uiVersion:'8.4.0',edition:'ATELIER365',engine:bundle.candidate.modelVersion,tests:get('tests'),passed:get('pass'),failed:get('fail'),originalSHA:hash(JSON.stringify(bundle.original)),priorForecastsPreserved:Object.keys(before.versions).length,currentUniqueForecasts:unique.size,assets:bundle.input.assets.length,actualAsOf:bundle.input.actualAsOf,releaseInputAndEngineUnchanged:release?true:null,pixelBrowserVerified:false,physicalDeviceVerified:false,liveDeployment:false,newCollectionDuringDesign:false,forecastAccuracyCertification:false};
fs.writeFileSync('reports/atelier/validation.json',JSON.stringify(report,null,2));
if(release)fs.writeFileSync('reports/atelier/release-validation.json',JSON.stringify(report,null,2));
const body=`# ATLAS 8.4 · ATELIER365\n\n시장의 변화, 판단의 기록. 장인정신·절제·정돈된 비례를 기준으로 ATLAS의 고유한 시각 체계를 적용했습니다. 브랜드 마크·서체 위계·색·차트 선·뉴스 패널·모바일 조작·로딩과 오류 화면을 함께 개선했습니다.\n\n## 실제 반영\n- 페이퍼 아이보리 #F5F1E8, 포슬린 #FFFCF6, 잉크 브라운 #2D241F, 새들 오렌지 #B94E20. 금융 의미색은 상승 #9E3344, 하락 #2B5B78로 분리합니다.\n- 시간축과 관측점을 결합한 독자 A 마크, 작은 favicon, 단색·반전 원본 SVG. 외부 폰트나 큰 배경 이미지를 추가하지 않았습니다.\n- 데스크톱 탐색 레일, 넓은 화면 3열·일반 2열·모바일 1열 카드. 종목 선택은 클릭 목록이며 모바일은 2열입니다. 날짜·재생 조작은 최소44px, 모바일 입력은16px입니다.\n- 실제 종가 잉크 실선 / 원본 모형 브라운 점선 / 진화 모형 틸 점선 / 돌발 변경 오렌지 점선. 그래프 좌표는 바꾸지 않았습니다.\n- 그래프 왼쪽·설명 오른쪽·버튼 아래의 집중 보기, 뉴스 내부 스크롤, 날짜 선택 상태, 전체 기간 표시를 보존합니다. 모바일 탐색에서 선택한 메뉴가 가로 영역 밖에 있으면 해당 메뉴를 보이게 이동합니다.\n- 색 대비가 낮던 입력 테두리를 전용 조작 경계색으로 분리했습니다. 키보드 초점·이동 감소·강제 색상 대응을 유지했습니다.\n\n## 조형 규칙\n본문은 운영체제 한국어 고딕, ATLAS 영문명만 절제된 세리프입니다. 숫자는 고정폭 숫자 기능을 사용합니다. 카드8px·버튼6px, 여백은4px 기반과16/24/40px 반응형 단계입니다. 실측선은 실선, 모형선은 점선으로 사용하며 미확보·손실·오류 상태는 숨기지 않습니다. 숫자의 진실성이 장식보다 우선입니다.\n\n## 검사와 보존\n최종 자동 검사 ${report.tests}개 통과, 실패0. 기존 ${report.priorForecastsPreserved}개 발행 전망을 보존했습니다. 종목은${report.assets}개, 보관 공통 종가 기준은${report.actualAsOf}입니다. 최초 재구성본 SHA: ${report.originalSHA}. 개발 릴리스의 전체 데이터 바이트·모든 기존 lib 해시 불변 결과는 reports/atelier/release-validation.json에 별도로 저장합니다. 일상 갱신은 새로운 입력·전망 추가를 허용하며 과거 발행본 변경을 차단합니다.\n\n실제 브라우저 픽셀·휴대폰 검수는 미완료입니다. 로컬 실행 파일이 없고 허용된 브라우저에서 로컬 페이지가 차단됐습니다. 자동 검사는 예측 정확도나 실제 기기 사용성 인증이 아닙니다. 365항목은 ATELIER365_STATUS.json에서 신규 적용·기존 유지·부분 적용·추가 확인을 나눕니다. 전부 구현·검증 완료했다고 주장하지 않습니다.\n\n## 배포 파일\nATLAS_Evolution_Netlify.zip은 수동 배포용 경량판입니다. 압축을 풀고 index.html이 바로 들어있는 폴더를 Netlify 수동 배포 영역에 올립니다. 큰 보관 자료는 작은 압축 조각으로 나뉘며 브라우저에서 원래 자료로 복원합니다. ATLAS_Netlify.zip은 전체 소스와 서버 코드를 포함한 보관판입니다. ZIP 생성은 실제 사이트 배포·서버 자동 수집·Google 로그인 연결을 뜻하지 않습니다.\n`;
fs.writeFileSync('public/downloads/ATELIER365_RELEASE.md',body);
for(const file of ['README.md','VALIDATION.md']){
 const previous=read(file),marker='\n<!-- ATELIER365_HISTORY -->\n';
 const history=previous.includes(marker)?previous.split(marker).slice(1).join(marker):previous;
 fs.writeFileSync(file,body+marker+'\n---\n이하 이전 릴리스 보존 기록\n\n'+history.replace(/^\n---\n이하 이전 릴리스 보존 기록\n\n/,''));
}
console.log(JSON.stringify(report));

// One-time UI release receipt. This script never recalculates prices or edits news.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),read=p=>fs.readFile(new URL(p,root),'utf8');
const hash=x=>createHash('sha256').update(x).digest('hex');
const before=JSON.parse(await read('reports/design-7.5/preservation.json'));
const oldTestMetadata=JSON.parse(await read('reports/design-7.5/test-metadata-before.json'));
const tap=await read('reports/tests.tap');
const count=n=>Number([...tap.matchAll(new RegExp('^# '+n+' (\\d+)$','gm'))].at(-1)?.[1]);
if(count('tests')!==194||count('pass')!==194||count('fail')!==0||count('cancelled')!==0||count('skipped')!==0)
  throw Error('전체 검사 194개 통과가 필요합니다.');
for(const [file,expected] of Object.entries(before)){
  let bytes=await fs.readFile(new URL(file,root));
  if(file==='public/data/atlas.json'){
    const bundle=JSON.parse(bytes);
    if(bundle.currentModelValidation.tests.sha256!==hash(tap))throw Error('최신 검사 파일 해시 불일치');
    // Only the TAP receipt may change. Restoring that one field must reproduce
    // the full original bundle byte hash, including all forecasts and research.
    bundle.currentModelValidation.tests.sha256=oldTestMetadata.sha256;
    bytes=Buffer.from(JSON.stringify(bundle));
  }
  if(hash(bytes)!==expected)throw Error('화면 수정 중 데이터/엔진 변경 발견: '+file);
}
const bundle=JSON.parse(await read('public/data/atlas.json'));
const prior=JSON.parse(await read('reports/press-before/preservation.json'));
const versions=new Map([bundle.original,...bundle.priorVersions,bundle.candidate].map(v=>[v.id,v]));
for(const [id,expected] of Object.entries(prior.versions))
  if(hash(JSON.stringify(versions.get(id)))!==expected)throw Error('기존 전망 해시 불일치: '+id);
if(versions.size!==14||bundle.candidate.assets.length!==52)throw Error('종목/전망 수 변경');
const result={version:'7.5.0',checkedAt:new Date().toISOString(),tests:{passed:194,failed:0,skipped:0},
  introduction:true,fullIntroductionDialog:true,graphAndValidationNavigation:true,keyboardFocusRestored:true,
  palette:'wine / ivory / gold',decorativeAtlasSvg:true,externalDesignRequests:0,
  assets:52,storedForecasts:14,protectedDataUnchanged:true,
  unchangedSourceFiles:Object.keys(before).filter(f=>f!=='public/data/atlas.json'),
  allowedMetadataChange:'currentModelValidation.tests.sha256: 현재 reports/tests.tap 해시로 갱신',
  forecastsRecalculated:false,independentReplayPreserved:true,
  pixelBrowserVerified:false,browserLimit:'실제 브라우저의 로컬 미리보기 주소 접근 제한. JSDOM 기반 화면 구조·조작 자동 검사는 통과.',
  codeFiles:['src/atlas.tsx','src/globals.css','scripts/verify_build.mjs'],
  testFiles:['tests/ui.test.mjs','tests/build-integrity.test.mjs']};
const md=`# ATLAS 7.5 소개와 디자인\n\n${result.checkedAt}\n\n- 첫 화면에 “근거로 전망하고, 결과로 검증합니다.” 소개를 넣었습니다.\n- ‘아틀라스 소개’ 창에 52종목의 뉴스 근거 연결·날짜별 설명·실제 결과 비교, 예측 정확도 개선 목표와 현재 연구 단계의 한계를 설명합니다.\n- 소개 창에서 종목별 그래프 또는 실제 검증 결과로 이동합니다. Escape로 닫기와 원래 버튼으로 키보드 초점 복귀를 검사했습니다.\n- 짙은 와인색 배경, 아이보리 글자, 가는 금색 선과 원형 지도 장식을 적용했습니다. 카드·메뉴·검색·모달·버튼의 여백과 서체를 정돈했습니다.\n- 외부 이미지나 폰트 요청을 추가하지 않았습니다. 좁은 화면에서 소개를 줄이고 장식은 배경으로 배치합니다.\n- 52종목 전체 기간 그래프, 종목별 하루 1초 재생, 중요 뉴스 정지, 날짜별 설명과 화면맞춤 배치를 유지합니다. 삭제한 위쪽 중복 전망선을 복원하지 않았습니다.\n\n## 검사와 보존\n\n기능 검사 194개 통과, 실패·건너뛰기 0개. 소개의 두 이동 버튼, 키보드 닫기와 초점 복귀, 52종목 그래프와 기존 재생·뉴스 확인 흐름을 자동 검사했습니다. 오래된 시작 파일에는 소개가 없으므로 포장을 거부하도록 검사도 갱신했습니다.\n\n입력·엔진·과거 감사 7개 파일의 해시 일치. atlas.json은 최신 검사 파일 해시 필드 한 곳만 갱신했고, 그 필드를 원복한 비교 해시가 수정 전과 일치합니다. 최초 원본과 기존 14개 전망의 개별 SHA256도 일치합니다. 가격 재계산이나 새 정확도 검증을 수행한 작업이 아닙니다.\n\n실제 브라우저의 픽셀 검사는 로컬 미리보기 주소 접근 제한으로 수행하지 못했습니다. JSDOM 기반 화면 구조·조작 검사와 실제 화면의 픽셀 검사를 구분합니다. 실제 Netlify 사이트 배포는 수행하지 않았습니다.\n`;
await fs.writeFile(new URL('reports/design-7.5/result.json',root),JSON.stringify(result,null,2)+'\n');
await fs.writeFile(new URL('reports/design-7.5/README.md',root),md);
await fs.writeFile(new URL('public/downloads/DESIGN_7_5.md',root),md);
const marker='<!-- DESIGN_7_5 -->';
const note=`\n${marker}\n## 7.5 소개·디자인 검사\n\n첫 화면 소개와 상세 소개 창, 와인·아이보리·금색 디자인 적용. 194개 검사 통과. 최초 원본 및 14개 전망 보존. 입력·엔진·감사 파일 7개 해시 일치, atlas.json의 검사 파일 해시만 갱신. 브라우저 픽셀 검사는 접근 제한으로 미수행. 상세 DESIGN_7_5.md. 이전 화면 검사 원본은 reports/design-7.5/VALIDATION.md와 reports/ui-7.4.1/에 보존했습니다.\n`;
for(const file of ['VALIDATION.md','public/downloads/VALIDATION.md','reports/AUDIT_REPAIRS.md','public/downloads/AUDIT_REPAIRS.md']){
  const previous=await read(file);
  if(!previous.includes(marker))await fs.writeFile(new URL(file,root),previous+note);
}
console.log(JSON.stringify(result));

import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),read=p=>fs.readFile(new URL(p,root),'utf8');
const before=JSON.parse(await read('reports/ui-7.4.1/preservation.json'));
const hash=x=>createHash('sha256').update(x).digest('hex');
const oldTestMetadata=JSON.parse(await read('reports/ui-7.4.1/test-metadata-before.json'));
const tap=await read('reports/tests.tap');
for(const [file,expected] of Object.entries(before)){
  let bytes=await fs.readFile(new URL(file,root));
  if(file==='public/data/atlas.json'){
    const bundle=JSON.parse(bytes);
    // The report writer refreshes this one receipt to identify the new TAP file.
    // Verify the new receipt, then restore only that field for the original-data
    // comparison. Any price, news, forecast or other metadata change still fails.
    if(bundle.currentModelValidation.tests.sha256!==hash(tap))throw Error('최신 검사 파일 해시 불일치');
    bundle.currentModelValidation.tests.sha256=oldTestMetadata.sha256;
    bytes=Buffer.from(JSON.stringify(bundle));
  }
  const actual=hash(bytes);
  if(actual!==expected)throw Error('화면 수정 중 데이터/엔진 변경 발견: '+file);
}
const count=n=>Number([...tap.matchAll(new RegExp('^# '+n+' (\\d+)$','gm'))].at(-1)?.[1]);
if(count('pass')!==194||count('fail')!==0||count('cancelled')!==0)throw Error('전체 검사 194개 통과가 필요합니다.');
const result={version:'7.4.1',checkedAt:new Date().toISOString(),tests:{passed:194,failed:0},
  upperForecastRemoved:true,actualOverviewPaths:1,mainForecastPaths:1,assets:52,
  protectedDataUnchanged:true,unchangedSourceFiles:Object.keys(before).filter(f=>f!=='public/data/atlas.json'),
  allowedMetadataChange:'currentModelValidation.tests.sha256: 현재 reports/tests.tap 해시로 갱신',priceChanges:false,independentReplayPreserved:true,
  pixelBrowserVerified:false,browserLimit:'실제 브라우저의 로컬 미리보기 주소 접근 제한. JSDOM 기반 화면 구조·조작 자동 검사는 통과.',
  codeFiles:['src/insights.tsx','src/atlas.tsx','src/globals.css'],
  testFile:'tests/ui.test.mjs'};
await fs.writeFile(new URL('reports/ui-7.4.1/result.json',root),JSON.stringify(result,null,2)+'\n');
const md=`# ATLAS 7.4.1 화면 수정\n\n${result.checkedAt}\n\n- 위쪽 실제 주가 영역의 중복 점선 예측선을 삭제했습니다. 실제 주가 실선만 표시합니다.\n- 아래 모형 전망선은 한 번 표시하며 전체 10월 30일 경로를 유지합니다.\n- 선택한 날짜의 실제 종가/모형 중앙값과 전 거래일 대비 변화를 한 칸에 표시합니다.\n- 전망 출발 날짜와 실제 종가를 별도 칸으로 분리했습니다.\n- 10월 30일 모형 중앙값을 가격으로 먼저 표시하고, 그 아래에 비교 기준일과 변화율을 붙였습니다. 방향 판단 유보 표시를 유지합니다.\n- 기존 와인색 배경과 금색·아이보리 색상을 유지했습니다. 작은 화면과 높이가 낮은 화면의 여백·글자 크기를 조정했습니다.\n- 52종목별 재생·정지·속도·날짜 선택, 중요 뉴스 확인 정지, 그래프 왼쪽/뉴스 오른쪽 배치를 유지합니다.\n\n## 검사\n\n기능 검사 194개 통과. 모든 종목에서 위쪽 실제 주가 실선 1개·점선 0개, 아래 전망선 1개를 확인했습니다. 선택 날짜, 전망 출발 가격과 비교 기준일 표시를 검사했습니다.\n\n실제 브라우저의 픽셀 검사는 로컬 미리보기 주소 접근 제한으로 수행하지 못했습니다. 화면 구조와 조작은 JSDOM 자동 검사로 확인했습니다.\n\n계산 엔진·입력·감사 기록 7개 파일의 SHA256이 일치합니다. atlas.json은 최신 검사 파일의 해시 필드 한 곳만 갱신했고, 그 필드를 되돌린 비교 해시가 수정 전과 일치합니다. 기존 14개 전망과 최초 원본을 보존하며 예측가격이나 정확도가 개선됐다는 뜻은 아닙니다. 실제 Netlify 사이트 배포는 수행하지 않았습니다.\n`;
await fs.writeFile(new URL('public/downloads/UI_7_4_1.md',root),md);
await fs.writeFile(new URL('reports/ui-7.4.1/README.md',root),md);
const note='\n<!-- UI_7_4_1 -->\n## 7.4.1 화면 검사\n\n위쪽 중복 점선 삭제 및 날짜·가격 구분 개선. 194개 검사 통과. 데이터·전망 불변. 입력/엔진/감사 파일 7개 해시 일치, atlas.json의 검사 파일 해시만 갱신. 실제 브라우저 픽셀 검사는 접근 제한으로 미수행. 상세 UI_7_4_1.md.\n';
for(const file of ['VALIDATION.md','public/downloads/VALIDATION.md','reports/AUDIT_REPAIRS.md','public/downloads/AUDIT_REPAIRS.md'])
  await fs.writeFile(new URL(file,root),(await read(file)).split('\n<!-- UI_7_4_1 -->')[0]+note);
console.log(JSON.stringify(result));

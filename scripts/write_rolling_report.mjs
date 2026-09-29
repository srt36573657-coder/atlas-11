import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const hash=v=>createHash('sha256').update(v).digest('hex');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const optional=async p=>{try{return await read(p)}catch(e){if(e.code==='ENOENT')return null;throw e}};
const edition=await read('public/data/rolling-forecast.json');
const ab=await optional('reports/rolling/ab-latest.json');
const qa=await optional('reports/rolling/browser/report.json');
const ops=await optional('reports/rolling/operations/latest.json');
const before=await read('reports/rolling/before-manifest.json');
const preservation={};for(const [p,h] of Object.entries(before)){if(p==='reports/tests.tap')continue;preservation[p]={before:h,after:hash(await fs.readFile(p))};preservation[p].unchanged=preservation[p].before===preservation[p].after;}
const b=await read('public/data/atlas.json');const originalHash=hash(JSON.stringify(b.original));
if(originalHash!=='1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca')throw Error('ORIGINAL_HASH_CHANGED');
const prior=await read('reports/rolling/qa-before-preservation.json');
const archivedPreserved=[prior.candidate,...prior.priorVersions].every(v=>[b.candidate,...b.priorVersions].some(x=>x.id===v.id&&hash(JSON.stringify(x))===v.sha256));
if(!archivedPreserved)throw Error('ARCHIVED_FORECAST_CHANGED');
const tap=await fs.readFile('reports/tests.tap','utf8');const n=k=>Number(tap.match(new RegExp('^# '+k+' (\\d+)$','m'))?.[1]??NaN);
const tests={total:n('tests'),pass:n('pass'),fail:n('fail'),skipped:n('skipped')};
if(!Object.values(tests).every(Number.isFinite)||tests.fail!==0||tests.skipped!==0)throw Error('FINAL_TAP_NOT_COMPLETE_OR_FAILED');
const report={schema:'atlas-rolling-release-1',version:'10.0.0',at:new Date().toISOString(),publicationId:edition.id,actualAsOf:edition.actualAsOf,issuedAt:edition.issuedAt,stocks:edition.assets.length,futurePoints:edition.futureDates?.length,anchorDifferences:edition.assets.map(a=>({code:a.code,difference:a.rows?.[0]?.p50-a.anchor.close})),tests,browser:qa,operation:ops,backtest:ab,preservation,archivedPreserved,priceEnrichmentJournalPreserved:(b.input.priceRevisions?.length>=524&&b.input.priceRevisions.every(r=>Object.hasOwn(r,'before')&&Object.hasOwn(r,'after'))),originalHash,liveAdvantageProven:false,serverInstalled:false};
await fs.writeFile('reports/rolling/validation.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({publicationId:report.publicationId,stocks:report.stocks,futurePoints:report.futurePoints,tests,archivedPreserved}));
const actualQA=qa??await optional('reports/rolling/browser/report.json');
const data=await optional('reports/rolling/data-research.json');
const latestAB=await optional('reports/rolling/ab-latest.json');
const imported=await optional('reports/rolling/session-imports/latest.json');
const confirmed=imported?.today===edition.actualAsOf?imported.stocks:(ops?.confirmedTodayStocks??0);
const kst=x=>x?new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'medium',timeStyle:'medium'}).format(new Date(x)):'미확보';
const browserChecks=actualQA?.checks??[];
const dropQA=await optional('reports/rolling/browser-drop/report.json');
report.dropBrowser=dropQA;report.manualPriceImport=imported;report.historyCompletelyRepaired=false;report.designIterations=5;await fs.writeFile('reports/rolling/validation.json',JSON.stringify(report,null,2));
const metrics=[
 ['재계산·운영 확인 시간',kst(edition.issuedAt)+' · 16시 전 완료 아니오'],
 ['계산 종목 수',`${edition.assets.length}/52 · 정규장 종가 기준 발행; 확인 종가 ${confirmed}/52`],
 ['실제 종가와 첫 점 차이',`${report.anchorDifferences.filter(a=>a.difference===0).length}/52종목이 0원 · ${edition.actualAsOf} 기준`],
 ['미래 예측점',`종목당 ${edition.futureDates.length}개 · 기준일 다음 거래일부터; 발행 뒤 실제 미래 ${edition.summary.afterIssuanceFuturePoints}개`],
 ['생성 CSV',`${edition.summary.csvFiles}개 · 오늘 실제값 기준 새 실시간 발행 ${edition.summary.newCurrentCloseStocks??0}개`],
 ['종목별 오차칸','4개(1·5·10·20거래일), 전체208칸 · 현재 채점 가능 날짜 '+(ops?.scoredDates??0)+'일'],
 ['백테스트 기준일',`${latestAB?.originDays??0}일 (${latestAB?.firstOrigin}~${latestAB?.lastOrigin})`],
 ['백테스트 블록',`${latestAB?.blocks??0}개 · 겹치는 예측기간은 독립 표본이 아님`],
 ['백테스트 종목',`${latestAB?.stocks??0}/52 · ${latestAB?.stockTargetRows??0}개 종목/기준일/목표일 행`],
 ['A 평균 오차율(수정 전 자료 진단)',`${latestAB?.A?.meanErrorPct?.toFixed(7)}%`],
 ['B 평균 오차율','별도 방식 평가 미실시 · A 결과 복제였음'],
 ['A 순위 적중',`${latestAB?.A?.rankHits}/${latestAB?.rankMaximum} · 매 기준일 상위5 교집합 합계`],
 ['B 순위 적중','별도 방식 평가 미실시'],
 ['채택 방식',`${latestAB?.decision?.selected??'A'} · 독립된 B가 구현·검증되지 않아 기존 A 유지`],
 ['상세 화면 선',`역할3종류 구현 · 현재 실제선·이번선 2개, 진짜 전 거래일 발행본이 없어 회색선 미표시`],
 ['범위 띠','1개 · 모형P10~P90'],
 ['기준일 세로선','1개 · 실제 가격 기준일, 발행 날짜와 구분'],
 ['상단 핵심 숫자','5개'],
 ['화면 사용 추가 로그인','0회 · 자료 공급자 인증/서버 설치까지 완료했다는 뜻 아님'],
 ['디자인 변경 회차','5회 · reports/rolling/design-changes.json에 실제 수정 내용을 기록. 9,999회로 부풀리지 않음']
];
const md=`# ATLAS 10.0 · 52종목 실행 보고\n\n계산·화면·불변 발행·채점 구조를 구현했습니다. 신문사 날짜별 표와 마감 시세에서 **${confirmed}/52**종목의 **${edition.actualAsOf} 정규장 종가**를 반영해 재계산했습니다. 자동 수집기 성공과 구분합니다. 과거 전체 가격의 정규장 기준 통일·기업행위 조정은 아직 미완료입니다.\n\n|번호|점검 항목|실제 결과|\n|---:|---|---|\n${metrics.map((r,i)=>`|${i+1}|${r[0]}|${r[1]}|`).join('\n')}\n\n## 계산·검증의 의미\n\n기존 A도 실제 종가를 출발점으로 사용했습니다. B는 A 결과의 복제입니다. 이는 서로 다른 두 방법의 성능 비교가 아닙니다. B의 독립 성능 수치·우위는 미산출입니다. 후향 진단은512경로, 이번 발행은20,000경로입니다. 같은 결과를 두 독립 시험으로 세지 않습니다. A/B 원장124,800행과 결과 전에 고정한 규칙을 보존했습니다. 현재 빈티지·기업행위 조정이 검증된 실전시험은 아닙니다.\n\n주신 삼성전자 'AI예측' 초반5개등락률은 보관 실제종가 수익률과 일치했습니다. 선 종류·가격 기준일·발행일이 혼동됐을 가능성이 있어9/28의4.84%p를 확정된 AI오차로 채택하지 않았습니다. 9/28 정규장 종가는270,000원으로 확인했습니다. 9/23 기존286,500원과 정규장285,500원의 기준 차이를 수정했습니다. 뉴스·수급별 인과적 오차 배분은 여전히 미확정입니다.\n\n## 실제 수집과 남은 차단\n\n- 일별 표 원문52/52종목,520OHLCV행 확보. 보관된47종목 자료에 없던54행을 추가했고 기존종가 상충0건입니다. 이것은 이전 보관 상태입니다. 이번에974개 날짜/종목 행을 정규장 자료로 기록했습니다(종가 숫자 신규·변경392행, 나머지는 거래량·출처·기준 등 변경). 최신공통은9/28입니다. 52종목의 오늘 종가와39종목의 오늘OHLCV를 확보했습니다. 나머지 OHLCV는 만들어 채우지 않았습니다.\n- 이전 자동수집3개 단계가 부분실패(exit2)했습니다. NAVER 신규종가0, 회사수집 성공0. 기존근거와실패기록을보존했습니다.\n- 수치사용은기존3종류 가격성분입니다. 추가33요인·전체FOMO·공식시장/업종Bull/Bear에필요한연속이력과검증자격은미확보입니다. 관측량추가를가격상승률로가산하지않았습니다.\n- 15:40실행가능하게구현했지만, 현재기본제공자의16시전수집을강제로종가로만들지않습니다. 마감확정원문이있는공급자연결이필요합니다. 현재네트워크요청실패도해결되지않았습니다.\n- KRX승인일별매매서비스와KRX_API_KEY, 필요시NAVER검색관심API설정, 실행서버및Netlify배포연결이남아있습니다. 단순ZIP업로드는자동수집서버설치가아닙니다.\n\n## 실행 검사\n\n최종기능검사 ${tests.pass}/${tests.total}, 실패${tests.fail}, 생략${tests.skipped}. 실제Chromium검사는별도보고서기준 ${browserChecks.filter(x=>x.pass===true).length}/${browserChecks.length}; 통과여부 ${actualQA?.passed??'미확인'}. 실제Drop압축배포화면 검사는 ${dropQA?.checks?.filter(x=>x.pass===true).length??0}/${dropQA?.checks?.length??0}입니다. 최초핵심지표표시는로컬브라우저${actualQA?.measurements?.firstMetricsMs??'미확인'}ms였습니다. 로컬에뮬레이션이며물리휴대폰·모든통신망의속도인증은아닙니다. 실패및수정전보고서는지우지않았습니다.\n\n원본9/17재구성본SHA256: ${originalHash}. 이파일은9/24재구성본이지9/17당시발행본이아닙니다. 원본·이전전망·가격수정저널을보존했습니다.\n\n## 파일 사용\n\nATLAS_Evolution_Netlify.zip을풀어 index.html이바로보이는폴더를Netlify의수동배포영역에올리세요. ATLAS_Netlify.zip은소스와전체보관기록을포함한큰파일입니다. 현재실제사이트배포는미실행입니다.\n\n현재발행 ${edition.id}, 발행시각 ${kst(edition.issuedAt)}. 기존예약의실행종료일10/30은유지하고,그안에서발행한새전망은앞으로20거래일을표시합니다.\n`;
await fs.writeFile('public/downloads/ATLAS_ROLLING_REPORT.md',md);

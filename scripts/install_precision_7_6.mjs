// One-time cumulative precision/research update. Never invent missing dates.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {forecast,checkForecast} from '../lib/news-engine.mjs';
import {mergeResearchRelease,researchCoverage} from '../lib/researched-news.mjs';
import {applyResult,plan} from './ATLAS_Research_13.mjs';
import {appendPressReport} from '../lib/press-runtime.mjs';
import {appendCycleReport} from '../lib/cycle-research.mjs';
const read=p=>JSON.parse(fs.readFileSync(p)),write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const b=read('public/data/atlas.json'),s=read('public/data/researched-news.json');
const releaseId='official-news-recheck-20260926-v9-precision76';
if(b.input.newsResearch.releaseId===releaseId)throw Error('This update has already been installed.');
const at=new Date().toISOString(),before=b.candidate,preservation=read('reports/precision-before/preservation.json');
const source=(url,status,summary,webRef)=>({url,accessStatus:status,summary,webRef,observedAt:at});
const rechecks=[
 {code:'034730',name:'SK',outcome:'BLOCKED',reason:'제319회 회사채 접수번호는 검색되지만 DART 원문이 웹 조회와 직접 HTTP에서 열리지 않아 수요예측·발행일 및 최종 정정 여부를 확정하지 못함.',nextAction:'DART 20260922000501 원문·정정본 또는 SK/대표주관사의 공식 증권신고서 첨부 확보.',attempts:[
  source('https://englishdart.fss.or.kr/dsbh001/main.do?rcpNo=20260922000501','search_excerpt_only','9/22 SK 제319회 증권신고서 검색 결과. 날짜 본문 미확보.','turn15search0'),
  source('https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260922000501','http_502','직접 요청 502. 검색 발췌를 원문 검증으로 계산하지 않음.','turn16view0'),
  source('https://www.sk-inc.com/kr/ir/irArchive.aspx','body_read','IR 자료실에서 확인한 최근 분기 자료는 8/14 상반기 자료. 회사채 확정 일정 근거는 확보하지 못함.','turn12view0')]},
 {code:'005490',name:'POSCO홀딩스',outcome:'BLOCKED',reason:'회사 새 홈페이지의 IR 경로를 재확인했으나 IR 상세 조회 오류로 3분기 발표의 정확한 날짜를 확정하지 못함.',nextAction:'IR 상세 페이지 변경 및 KIND의 기업설명회 개최 공시 확인.',attempts:[
  source('https://www.posco-inc.com/hs91a1-front/app/index.html','body_read','공식 홈페이지에서 IR 개요·자료실 경로 확인. 첫 화면 자체에는 확정 발표일 없음.','turn18view0'),
  source('https://www.posco-inc.com/ir/ir-material','http_502','공식 IR 상세 자료 응답 오류.','turn19view2')]},
 {code:'010130',name:'고려아연',outcome:'BLOCKED',reason:'회사채 일정 관련 보도는 있으나 공식 IR·공시 페이지에서 본문 날짜와 정정 여부를 확보하지 못함. 종전 상충 날짜를 그대로 확정하지 않음.',nextAction:'고려아연·KB증권·하나증권 또는 DART의 최종 증권신고서에서 수요예측·납입일 확인.',attempts:[
  source('https://investors.koreazinc.co.kr/ko/investors/ir-events/ir-calendar/','page_body_only','페이지 탐색 영역은 열리지만 일정 데이터의 날짜는 본문에서 확인되지 않음.','turn13view0'),
  source('https://investors.koreazinc.co.kr/ko/investors/announcements/disclosure/','page_body_only','공시 페이지 HTTP 200. 동적으로 채워지는 공시 목록은 확보되지 않아 무공시라고 판정하지 않음.','turn17view1'),
  source('https://m.sateconomy.co.kr/news/view/1065608866791104','search_excerpt_only','9/26 기사 검색 발췌에 10/1 수요예측이 있으나 원문 미확보이며 발행사 공시가 아님.','turn17search5')]},
 {code:'138040',name:'메리츠금융지주',outcome:'BLOCKED',reason:'공식 IR 목록은 동적으로 구성되며 이번 조회에서 기간 내 행사 본문을 확보하지 못함. 보조 목록 요청의 빈 응답만으로 미발표를 확정하지 않음.',nextAction:'공식 IR행사 목록의 완전한 본문 또는 KIND 개최 공시 확보.',attempts:[
  source('https://www.meritzgroup.com/web/ko/ir/ir1.do','page_body_only','실적발표·IR행사 메뉴 확인, 일정 행은 조회 본문에 없음.','turn13view1'),
  source('https://www.meritzgroup.com/web/ir1_2_search.do','empty_dynamic_response','HTTP 200, result 빈 배열. 필터/동적 렌더링 영향을 배제할 수 없음.',null)]},
 {code:'047050',name:'포스코인터내셔널',outcome:'NOT_PUBLISHED',reason:'공식 9/16 미국 셰일가스 인수 설명자료 확보. 9/14 계약 및 11월 중순 거래종결 목표로, 9/17~10/30의 정확한 새 예정일을 채우는 근거가 아님. 전시회 참가 확정 원문도 미확보.',nextAction:'기간 내 IR·인수 일정 정정 또는 All-Energy 출전자 명단의 회사 참가 근거 확인.',attempts:[
  source('https://www.poscointl.com/irActivity','body_read','최근 IR 목록에 9/16 셰일가스 사업설명회와 9/9 컨퍼런스가 표시됨.','turn19view4'),
  source('https://www.poscointl.com/upload/file/202609/202609166e0c1e9b5e1f49daaaa570068773b9b9NBuG2KQ.pdf','body_read','공식 설명자료 6쪽: 거래규모 5억5천만 달러, 9/14 본계약, 11월 중순 종결 목표. 확정 일자 및 기간 요건 미충족.','turn20view0')]},
 {code:'029780',name:'삼성카드',outcome:'NOT_PUBLISHED',reason:'공식 IR 달력의 2026년 항목은 7/27 상반기와 4/24 1분기 발표. 10/28은 2025년 항목이므로 올해로 바꾸지 않음. 최신 채권 잔액·조기상환 상태도 미확인.',nextAction:'2026년 3분기 발표 일정 게시 또는 최신 채권 발행·잔액 공식 자료 확인.',attempts:[
  source('https://biz.samsungcard.com/company/IR/investor-relatioin/calender/UHPPCI0143M0.jsp','body_read','IR 달력 상단 연도와 일자를 대조. 2026년 3분기 확정일 미표시.','turn16view1')]},
 {code:'030000',name:'제일기획',outcome:'NOT_PUBLISHED',reason:'공식 IR Upcoming에 예정 이벤트가 없다고 표시됨. Past의 최신 행사는 8/27로 대상 기간 밖. 추정 실적일을 확정일로 채우지 않음.',nextAction:'IR Upcoming 또는 KIND 실적발표·기업설명회 공시가 갱신되면 확인.',attempts:[
  source('https://na.cheil.com/kr/ir/','body_read','Upcoming: 예정 이벤트 없음. Past: 2026-08-27 시티증권 컨퍼런스가 첫 항목.','turn13view2')]},
];
const report={schema:1,checkedAt:at,window:[b.input.origin,b.input.end],newVerifiedScheduledEvents:0,
  checkedUnresolvedCompanies:7,verifiedOfficialContextDocuments:1,allNewsComplete:false,
  method:'Official source bodies; blocked/dynamic/secondary-only results are not verified dates.',rechecks,trustProbability:null};
write('reports/news-recheck-7-20260926.json',report);write('public/downloads/news-recheck-7-20260926.json',report);
let state=read('reports/research-13-state.json');
for(const r of rechecks)state=applyResult(state,{code:r.code,outcome:r.outcome,reason:r.reason,checkedUrls:r.attempts.map(s=>s.url),nextAction:r.nextAction},Date.parse(at));
write('reports/research-13-state.json',state);write('public/downloads/research-13-state.json',state);
for(const r of rechecks){
  const row=s.research.assets.find(a=>a.code===r.code);
  row.rechecks??=[];row.rechecks.push({...r,note:r.reason,checkedAt:at,priceImpact:'abstain',trustProbability:null,allPublicSourcesExhausted:false});
  row.latestRecheckAt=at;
  for(const q of r.attempts)if(!row.sources.some(s=>s.url===q.url))row.sources.push({name:'추가 확인 경로',url:q.url});
}
s.releaseId=releaseId;s.checkedAt=at;s.research.releaseId=releaseId;s.research.checkedAt=at;
s.research.latestRecheckSummary={checked:7,newVerifiedScheduledEvents:0,remaining:7,report:'news-recheck-7-20260926.json'};
b.input=mergeResearchRelease(b.input,{...b.input,events:s.events,newsResearch:s.research});
b.candidate=forecast(b.input,{origin:before.origin,paths:20000,seed:20260917,informationCutoff:b.input.informationAsOf,createdAt:at,live:false});
b.checks=checkForecast(b.candidate,b.input);
if(!b.checks.complete||hash(b.original)!==preservation.original||hash(b.input.assets)!==preservation.prices||hash(b.input.events)!==preservation.events)throw Error('Preservation or forecast validation failed');
b.priorVersions=[...new Map([...b.priorVersions,before].map(v=>[v.id,v])).values()];
const versions=new Map([b.original,...b.priorVersions,b.candidate].map(v=>[v.id,hash(v)]));
for(const [id,h] of Object.entries(preservation.versions))if(versions.get(id)!==h)throw Error('Prior version changed: '+id);
b.input.newsResearch.assets=researchCoverage(b.input,b.candidate);
b.revision++;b.updates.push({type:'precision-and-official-source-recheck',at,releaseId,previous:before.id,next:b.candidate.id,paths:20000,newVerifiedScheduledEvents:0,unresolved:7,originalUnchanged:true});
if(b.pressResearch)b.pressResearch=appendPressReport(b.pressResearch,b.input,b.candidate,{cutoff:at});
if(b.cycleResearch)b.cycleResearch=appendCycleReport(b.cycleResearch,b.input,b.candidate,{cutoff:at});
b.precisionUpdate={appVersion:'7.6.0',checkedAt:at,newsComplete:false,remainingNewsCompanies:7,manualWorkGuard:true,automaticStopHookVerified:false};
s.research=b.input.newsResearch;
for(const [p,x] of [['public/data/atlas.json',b],['public/data/input.json',b.input],['public/data/researched-news.json',s],['reports/news_research_52.json',b.input.newsResearch],['public/downloads/news_research_52.json',b.input.newsResearch],['public/downloads/press_history_report.json',b.pressResearch.report],['public/downloads/cycle_research.json',b.cycleResearch.report]])write(p,x);
console.log(JSON.stringify({id:b.candidate.id,paths:b.candidate.paths,rows:b.candidate.rowCount,priorPreserved:Object.keys(preservation.versions).length,news:plan(state)}));

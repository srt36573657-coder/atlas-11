// One-off user-authorized v7 migration. Daily operation uses refresh, never this script.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {forecast,checkForecast,MODEL_VERSION} from '../lib/news-engine.mjs';
import {mergeResearchRelease,researchCoverage} from '../lib/researched-news.mjs';
const read=p=>JSON.parse(fs.readFileSync(p)),write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x)),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const b=read('public/data/atlas.json'),A=read('reports/rebuild52-research-a.json'),B=read('reports/rebuild52-research-b.json');
const releaseId='official-news-20260926-8-v7';
if(b.input.newsResearch?.releaseId===releaseId&&b.candidate.modelVersion===MODEL_VERSION){console.log('이미 설치된 개편입니다.');process.exit(0);}
const old=b.candidate,original=hash(b.original),now=new Date().toISOString();
if(original!=='1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca')throw Error('원본 불일치');
const rows=[...A.assets,...B.assets];
if(rows.length!==52||new Set(rows.map(a=>a.code)).size!==52||rows.some(r=>!b.input.assets.some(a=>a.code===r.code)))throw Error('52종목 조사 누락');
const source=(url,name,role='issuer')=>({url,name,publisherRole:role,primaryPublisherVerified:true,sourceBodyRead:true,attestedAt:now,retrievedAt:now});
const created=[];
function add(code,id,kind,name,date,target,sources,extra={}){
 const e={id:'REVIEW:'+id,name,kind,eventDate:date,announcementDate:date,targetDate:target,scope:{type:'company',codes:[code]},
  status:'scheduled',availableAt:now,firstObservedAt:now,publishedAt:null,timezone:'Asia/Seoul',importance:'review',
  publicationDate:null,sources,reviewReleaseId:releaseId,originalVintageVerified:false,
  channel:'공식 원문에서 날짜와 대상을 확인. 비교 가능한 과거 표본·시장 예상 대비 차이·조정가격 근거 부족으로 가격 영향 유보.',
  dateBasis:'달력 일정을 기존 한국 거래일에 배치. 최초 가격 반응일이나 주가 영향 확정 아님.',...extra};
 e.reviewEvidence={rootReviewed:true,eventDate:e.eventDate,targetDate:e.targetDate,sources:e.sources,evidenceSummary:e.channel,checkedAt:now,...e.reviewEvidence};
 created.push(e);return e;
}
for(const c of A.newCalendarCandidates){
 add(c.code,c.eventId.replace('REBUILD:',''), 'CAPITAL_INCREASE',c.name,c.eventDate,c.targetDate,[source(c.sourceUrl,'발행사 신주발행 공고')],{
  phaseId:c.kind,economicEventId:c.economicEventCluster,publicationDate:c.publicationDate,
  channel:'공식 유상증자 공고의 '+c.sourceBodyLocation+'. 두 날짜는 하나의 유상증자의 단계. 권리락일·기계적 하락률·신주인수권증서 가격을 보통주 전망에 대입하지 않음. DART 후속 정정 전수 확인 미완료; 가격 영향 유보.',
  reviewEvidence:{sourceSnapshot:c.sourceSnapshot,sourceSnapshotSha256:c.sourceSnapshotSha256,correctionCheck:c.correctionCheck}
 });
}
const fda='https://www.fda.gov/drugs/resources-information-approved-drugs/fda-approves-lirafugratinib-previously-treated-unresectable-locally-advanced-or-metastatic';
const elevar='https://elevartx.com/2026/09/23/elevar-fda-approval-lyrfigtu-2/';
add('028300','028300:FDA-APPROVED:20260923','DRUG_APPROVAL','HLB 자회사 Elevar · Lyrfigtu FDA 승인 사실','2026-09-23','2026-09-28',[source(fda,'미국 FDA 승인 원문','regulator'),source(elevar,'Elevar 공식 발표·HLB 지분 관계')],{
 status:'announced',publicationDate:'2026-09-23',timezone:'America/New_York',
 economicEventId:'028300:LYRFIGTU:FDA:20260923',throughSubsidiary:{name:'Elevar Therapeutics',ownershipSource:elevar},
 channel:'9/23 미국 FDA 승인과 Elevar의 HLB 다수 지분 자회사 관계를 원문 확인. 이미 발표된 사실이며 9/27 미래 승인으로 입력하지 않음. 정확한 공개 시각·시장 예상 대비 차이·주가 영향은 미확보.',
 dateBasis:'미국 9/23 달력 날짜만 확인. 휴장 후 한국 거래일 9/28에 보수적으로 설명 배치; 최초 주가 반응일 확정 아님.',
 publicationTime:null,marketReactionDateEstimated:true
});
add('259960','259960:ASCENT-PREORDER:20261006','COMPANY_PRODUCT_PRESENTATION','크래프톤 · The Ascent Switch 2 예약 판매 시작','2026-10-06','2026-10-06',[source('https://prtimes.jp/main/html/rd/p/000000424.000082433.html','KRAFTON JAPAN 발행 보도자료')],{
 publicationDate:'2026-09-10',publishedAt:'2026-09-10T12:30:00+09:00',eventTime:'10:00',timezone:'Asia/Tokyo',
 channel:'공식 회사 발표의 10/6 10:00 일본시간 예약 판매 시작. 12/3 출시일은 기간 밖. 판매·매출·주가 효과 미확인.'
});
add('278470','278470:MERGER-RECORD:20260928','COMPANY_GOVERNANCE_RECOMMENDATION','에이피알 · 합병 반대의사 표시 권리 주주확정 기준일','2026-09-28','2026-09-28',[source('https://www.apr-in.com/public-notice-view.php?page=1&wr_id=85','에이피알 공식 공고')],{
 publicationDate:'2026-09-09',channel:'APR팩토리 소규모 합병 반대의사 표시 권리 기준일. 합병 완료일·배당일이 아님. 공식 현재 공고 확인, DART 9/16 정정 내용 원문 접근 제한. 가격 영향 유보.'
});
add('036460','036460:VOTING-RECORD:20261006','COMPANY_GOVERNANCE_RECOMMENDATION','한국가스공사 · 의결권 주주확정 기준일','2026-10-06','2026-10-06',[source('https://www.kogas.or.kr/site/koGas/bbs/View.do?Key=1050705000000&boardIdx=47771&cbIdx=58&pageIndex=1&pageOffset=0&searchKey=&searchValue=','한국가스공사 공식 공고')],{
 publicationDate:'2026-09-18',channel:'9/18 공식 공고 본문에서 10/6 주주명부 기준 의결권 부여를 확인. 주주총회 개최일·배당일·납부일이 아님. 가격 영향 유보.'
});
add('214370','214370:EURETINA-EXHIBIT:20261001','COMPANY_EXHIBITION_EURETINA','케어젠 · EURETINA 전시 참가','2026-10-01','2026-10-02',[source('https://euretina.org/vienna-2026/exhibitors/','EURETINA 주최자 참가사 목록','organizer'),source('https://euretina.org/vienna-2026/','EURETINA 주최자 행사 기간','organizer')],{
 timezone:'Europe/Vienna',dateEnd:'2026-10-04',eventTime:null,
 channel:'주최자에서 CAREGEN CO LTD 부스 D16과 10/1~4 행사를 확인. 10/4 구두 발표 검색 후보는 회사 본문 접근 제한·세부 세션 미대조로 별도 유보. 임상 결과·효능·매출·가격 효과 미확인.',
 dateBasis:'비엔나 10/1 시작 날짜만 확인. 시각 미확보로 다음 한국 거래일 10/2에 보수적 설명 배치; 가격 반응 확정 아님.'
});
const research=structuredClone(b.input.newsResearch);
research.releaseId=releaseId;research.checkedAt=now;research.eventIds=[...new Set([...research.eventIds,...created.map(e=>e.id)])];
research.rebuild52={version:'7.0.0',checkedAt:now,requestedCodes:b.input.assets.map(a=>a.code),checkedCodes:rows.map(a=>a.code),checkedCount:52,
 allPrimaryBodiesRead:false,allMaterialSchedulesConfirmed:false,addedEventIds:created.map(e=>e.id),
 batches:['reports/rebuild52-research-a.json','reports/rebuild52-research-b.json'],newIndependentEconomicEvents:6,
 rejectedCandidates:B.candidates.filter(c=>['month_only','search_only_pending'].includes(c.status)),fixedNewsQuota:null,trustProbability:null};
for(const r of research.assets){const re=rows.find(a=>a.code===r.code);r.rechecks=[...(r.rechecks??[]),re];r.latestRecheckAt=now;}
const priorManifest=read('public/data/researched-news.json');
write('reports/rebuild52-before/researched-news-release7.json',priorManifest);
const manifest={...priorManifest,releaseId,checkedAt:now,events:[...priorManifest.events,...created],research};
write('public/data/researched-news.json',manifest);
b.input=mergeResearchRelease(b.input,{...b.input,events:manifest.events,newsResearch:research});
b.candidate=forecast(b.input,{origin:old.origin,paths:10000,seed:20260917,informationCutoff:b.input.informationAsOf,createdAt:now,live:false});
b.checks=checkForecast(b.candidate,b.input);
if(!b.checks.complete||b.candidate.assets.length!==52||hash(b.original)!==original)throw Error('원본/52종목/계산 검사 실패');
b.priorVersions=[...new Map([...(b.priorVersions??[]),old].map(v=>[v.id,v])).values()];b.revision++;
b.updates.push({type:'user-authorized-rebuild52-v7',at:now,model:MODEL_VERSION,releaseId,previous:old.id,next:b.candidate.id,originalUnchanged:true,newIndependentMarketValidation:false});
b.input.newsResearch.assets=researchCoverage(b.input,b.candidate);
b.companyNewsCollection={registry:read('reports/collection52/registry.json'),state:read('reports/collection52/state.json'),report:read('reports/collection52/latest.json')};
for(const [p,data]of [['public/data/atlas.json',b],['public/data/input.json',b.input],['public/downloads/news_research_52.json',b.input.newsResearch],['reports/news_research_52.json',b.input.newsResearch]])write(p,data);
write('reports/rebuild52-installed.json',{at:now,releaseId,model:MODEL_VERSION,id:b.candidate.id,originalSHA256:original,priorVersions:b.priorVersions.length,events:b.candidate.eventGate.accepted.length,byScope:b.candidate.newsCoverage.byScope,newEventIds:created.map(e=>e.id),research52Checked:rows.length,trustProbability:null});
console.log(fs.readFileSync('reports/rebuild52-installed.json','utf8'));

// Install only the independently reviewed events from this research batch.
// Research failures remain in the tracker and do not become dated news.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {TARGETS,validateState} from './ATLAS_Research_13.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const file='public/data/researched-news.json', release=read(file);
const releaseId='official-news-20260926-7';
if(release.releaseId===releaseId)process.exit(0);
assert.equal(release.releaseId,'official-news-20260926-6','Reload and merge the newer research release');
const state=validateState(read('reports/research-13-state.json'));
const additions=read('reports/research-13/root-reviewed-events.json');
const files=['finance','industrial','consumer','smallcap'].map(v=>`reports/research13-${v}.json`);
const reports=files.map(read), records=reports.flatMap(r=>r.assets);
assert.deepEqual(records.map(v=>v.code).sort(),[...TARGETS].sort());
const verified=TARGETS.filter(code=>state.rows[code].state==='VERIFIED');
assert.deepEqual([...new Set(additions.map(v=>v.code))].sort(),[...verified].sort());
assert.ok(additions.length>0);
const at=new Date().toISOString(), before=structuredClone(release.research.assets);
for(const e of additions){
 const proof=state.rows[e.code].evidence;
 assert.equal(proof.eventId,e.id);assert.equal(proof.eventDate,e.eventDate);
 assert.equal(proof.targetDate,e.targetDate);assert.equal(e.rootReviewed,true);
 assert.ok(!release.events.some(v=>v.id===e.id),'Duplicate news event');
 const sources=e.sources.map(v=>({...v,name:v.name??'기업·주최기관 공식 자료',retrievedAt:at}));
 assert.ok(sources.some(v=>v.url===proof.sourceUrl));
 const description=[e.evidenceSummary,e.channel,e.priceEffect,e.correctionCheck,e.targetDateBasis??e.dateBasis].filter(Boolean).join(' ');
 release.events.push({id:e.id,name:e.title,kind:e.kind,eventDate:e.eventDate,
  announcementDate:e.eventDate,targetDate:e.targetDate,scope:{type:'company',codes:[e.code]},
  availableAt:at,firstObservedAt:proof.observedAt,publishedAt:null,publishedDate:e.publishedDate??null,
  status:'scheduled',sources,channel:description+' 비교 가능한 과거 사건 표본 부족으로 가격 영향 유보.',
  reference:e.throughSubsidiary?'완전자회사 사업 일정 · 모회사 직접 IR 아님 · 가격 효과 미검증':'공식 예정 일정 · 실제 결과 미공개 · 가격 효과 미검증',
  dateBasis:e.targetDateBasis??e.dateBasis,importance:'review',reviewReleaseId:releaseId,
  reviewEvidence:{...structuredClone(e),trackerEvidence:structuredClone(proof)}});
}
for(const code of TARGETS){
 const row=release.research.assets.find(v=>v.code===code), old=before.find(v=>v.code===code);
 const record=records.find(v=>v.code===code),own=additions.filter(v=>v.code===code);
 row.researchHistory=[...(row.researchHistory??[]),{checkedAt:old.checkedAt,status:old.status,note:old.note,researchBasis:old.researchBasis,sources:structuredClone(old.sources)}];
 row.checkedAt=at;row.status=own.length?'company_schedule_confirmed':'date_not_confirmed';
 row.note=own.length?own.map(v=>`${v.title}: ${v.eventDate} (한국 거래일 ${v.targetDate}).`).join(' ')+' 가격 영향은 유보합니다.':record.reason??record.note;
 if(own.some(v=>v.throughSubsidiary))row.note+=' KCC 본사의 직접 IR 일정이 아니라 간접 완전자회사 모멘티브 전시 참가입니다.';
 if(code==='226950')row.note+=' 금융위 공동주최 자료로 참가를 확인했으며 기존 KIRS 접근 실패와 후속 브로슈어 미대조 기록은 유지합니다.';
 row.researchBasis=own.map(v=>v.evidenceSummary??v.channel).filter(Boolean).join(' ')||record.reason||record.note;
 const sourceObjects=[...own.flatMap(v=>v.sources),...(record.sources??[]),...(record.checkedUrls??[]).map(url=>({url,name:'조사 경로; 이 링크만으로 사건 확정 아님'}))];
 row.sources=[...new Map([...sourceObjects,...row.sources].filter(v=>v.url).map(v=>[v.url,{...v,name:v.name??'공식 자료·조사 경로'}])).values()];
 row.latestResearchReport=files[reports.findIndex(v=>v.assets.some(a=>a.code===code))];
 assert.ok(row.note);
}
const follow=release.research.followup25;
follow.fullyConfirmedCompanyScheduleCodes=[...new Set([...follow.fullyConfirmedCompanyScheduleCodes,...verified])];
follow.unresolvedCodes=follow.requestedCodes.filter(v=>!follow.fullyConfirmedCompanyScheduleCodes.includes(v));
follow.complete=follow.unresolvedCodes.length===0;
follow.note=`25종목 중 기업 관련 일정 ${follow.fullyConfirmedCompanyScheduleCodes.length}종목 확인, ${follow.unresolvedCodes.length}종목 미확보. 직접 IR·사업 행사·완전자회사 전시를 구분하며 가격 영향은 별도 검증 대상.`;
release.research.batchReviewHistory=[...(release.research.batchReviewHistory??[]),structuredClone(release.research.batchReview)];
release.research.batchReview={checkedAt:at,requestedCodes:[...TARGETS],searchedCount:13,agentCount:4,
 allRequestedReviewed:true,allSchedulesConfirmed:verified.length===13,newlyConfirmedCodes:verified,
 addedEventIds:additions.map(v=>v.id),unresolvedCodes:TARGETS.filter(v=>!verified.includes(v)),reports:files,
 throughSubsidiaryCodes:additions.filter(v=>v.throughSubsidiary).map(v=>v.code),
 tracker:{file:'reports/research-13-state.json',revision:state.revision,sha256:createHash('sha256').update(JSON.stringify(state)).digest('hex')},
 policy:'4개 조사팀 병렬 검색 및 부모의 공식 원문 독립 대조. 13종목 모두 증거·설치·검사 완료 전 taskComplete=false. 사업 일정은 예측 적중률 인증이 아님.'};
release.releaseId=releaseId;release.checkedAt=at;
Object.assign(release.research,{releaseId,checkedAt:at,eventIds:release.events.map(v=>v.id)});
fs.writeFileSync(file,JSON.stringify(release));
console.log({releaseId,added:additions.length,verified:verified.length,unresolved:13-verified.length,taskComplete:false});

import {scopeErrors,appliesTo,scopeCounts,eventIdentity} from './news-scope.mjs';
export function mergeResearchRelease(input,releaseInput){
 const incoming=releaseInput.newsResearch;
 if(!incoming||incoming.releaseId===input.newsResearch?.releaseId||Date.parse(incoming.checkedAt)<=Date.parse(input.newsResearch?.checkedAt??''))return input;
 if(input.origin!==releaseInput.origin||input.end!==releaseInput.end)throw Error('뉴스 조사 기간 불일치');
 const next=structuredClone(input),conflicts=[];
 // A release is a cumulative manifest. Older records keep their original tags.
 const ids=new Set(incoming.eventIds??[]),curated=releaseInput.events.filter(e=>ids.has(e.id));
 if(curated.length!==ids.size)throw Error('조사 자료 목록의 뉴스 누락');
 for(const e of curated){
  if(!e.id.startsWith('REVIEW:')||!Number.isFinite(Date.parse(e.availableAt))||scopeErrors(e,next.assets,incoming.checkedAt).length)throw Error('조사 뉴스 입력 오류: '+e.id);
  const old=next.events.find(v=>v.id===e.id);
  if(old){if(eventIdentity(old)!==eventIdentity(e))conflicts.push(e.id);continue;}
  next.events.push(structuredClone(e));
 }
 next.newsResearch={...structuredClone(incoming),localConflicts:conflicts};
 next.informationAsOf=[input.informationAsOf,incoming.checkedAt].sort((a,b)=>Date.parse(a)-Date.parse(b)).at(-1);
 next.coverage={...next.coverage,note:'확인한 기업·업종 일정만 대상 종목에 연결. 날짜 미확인·과거 표본 부족·원문 접근 제한은 개별 공개.'};
 return next;
}
export function researchCoverage(input,version){
 return (input.newsResearch?.assets??[]).map(r=>{const a=input.assets.find(a=>a.code===r.code),related=version.eventGate.accepted.filter(e=>appliesTo(e,a)),p=version.assets.find(a=>a.code===r.code);return {...r,byScope:scopeCounts(related),eventIds:related.map(e=>e.id),usedNewEvents:p?.news.filter(n=>n.id.startsWith('REVIEW:')&&n.used).length??0};});
}

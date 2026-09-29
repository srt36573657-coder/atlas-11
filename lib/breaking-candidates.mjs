/** Acquisition-to-review bridge. No requests, event approval, or price calculations. */
import {hashString} from './engine.mjs';
const stamp=value=>typeof value==='string'&&/(Z|[+-]\d\d:\d\d)$/.test(value)&&Number.isFinite(Date.parse(value));
const key=value=>hashString(JSON.stringify(value));
const meaningful=/IR|invest|disclos|earnings|results|news|release|공시|실적|설명회|일정|공지|보도|계약|수주|합병|인수|정정|취소|증자|승인/i;
function publicURL(value){
 let u;try{u=new URL(value);}catch{throw Error('INVALID_URL');}
 const host=u.hostname.toLowerCase().replace(/\.$/,'');
 if(!['https:','http:'].includes(u.protocol)||u.username||u.password||(u.port&&!['80','443'].includes(u.port))||!host.includes('.')||/^[\d.]+$/.test(host)||host.includes(':')||/(^|\.)(localhost|local|internal|test|invalid|example|onion)$/.test(host))throw Error('UNSAFE_URL');
 u.hostname=host;u.hash='';return u.href;
}
export function syncBreakingCandidates(breaking,collection,{now=new Date(),codes=[],start='2026-09-17',end='2026-10-30'}={}){
 const instant=now instanceof Date?now.toISOString():now;
 if(!stamp(instant))throw Error('INVALID_CANDIDATE_CLOCK');
 const day=new Date(Date.parse(instant)+9*3600000).toISOString().slice(0,10);
 const out=structuredClone(breaking??{});
 for(const field of ['candidates','collectionStatus','candidateErrors']){if(out[field]!==undefined&&!Array.isArray(out[field]))throw Error('INVALID_BREAKING_HISTORY');out[field]??=[];}
 if(day<start||day>end)return breaking??out;
 const append=(field,record)=>{if(!out[field].some(x=>x.id===record.id))out[field].push(record);};
 const reject=(sourceId,reason,detail)=>{const content={sourceId,reason,detail};append('candidateErrors',{id:'candidate-error-'+key(content),...content,recordedAt:instant});};
 const report=collection?.report;
 const status={mode:'DAILY_COLLECTOR_BRIDGE_NOT_REALTIME',status:!collection?'NOT_CONNECTED':!report?'NOT_RUN':report?.partial||collection.exitCode===2?'PARTIAL_OR_FAILED':'OBSERVED_UNREVIEWED',reportId:report?.id??null,startedAt:report?.startedAt??null,endedAt:report?.endedAt??report?.at??null,successfulSources:report?.successfulSources??0,failedSources:report?.failedSources??0,deferredSources:report?.deferredSources??0,error:report?.error??null,newVerifiedEvents:0,rawReport:report?structuredClone(report):null};
 if(status.rawReport){delete status.rawReport.reusedAt;delete status.rawReport.reusedObservation;}
 append('collectionStatus',{id:'candidate-collection-'+key(status),...status});
 const allowed=new Set(codes);
 for(const source of collection?.registry?.sources??[]){
  let sourceURL;try{sourceURL=publicURL(source.url);}catch(e){reject(source.id,e.message,String(source.url));continue;}
  const sourceCodes=[...new Set(source.codes??[])].sort();
  if(!sourceCodes.length||sourceCodes.some(code=>!allowed.has(code))){reject(source.id,'UNKNOWN_TARGET_CODE',sourceCodes);continue;}
  const entry=collection?.state?.sources?.[source.id];
  for(const snapshot of [...(entry?.revisions??[]),...(entry?.lastGood?[entry.lastGood]:[])]){
   const observedAt=snapshot.firstObservedAt??snapshot.observedAt;
   if(!stamp(observedAt)||Date.parse(observedAt)>Date.parse(instant)){reject(source.id,'INVALID_OR_FUTURE_OBSERVATION',observedAt??null);continue;}
   const observedDay=new Date(Date.parse(observedAt)+9*3600000).toISOString().slice(0,10);
   if(observedDay<start||observedDay>end)continue;
   if(!/^[a-f0-9]{64}$/i.test(snapshot.contentSha256??'')||!(snapshot.bytes>0)){reject(source.id,'NO_COLLECTED_BODY_EVIDENCE',snapshot.contentSha256??null);continue;}
   let finalURL;try{finalURL=publicURL(snapshot.finalUrl??snapshot.url??sourceURL);if(new URL(finalURL).origin!==new URL(sourceURL).origin)throw Error('CROSS_ORIGIN_SOURCE');}catch(e){reject(source.id,e.message,snapshot.finalUrl??null);continue;}
   const extracted=snapshot.candidates??{};
   const links=(extracted.links??[]).filter(link=>typeof link.title==='string'&&meaningful.test(link.title+' '+link.url));
   const documents=[...(extracted.pageTitle?[{url:finalURL,title:extracted.pageTitle,isPage:true}]:[]),...links.slice(0,20)];
   if(links.length>20)reject(source.id,'DOCUMENT_REVIEW_CAP', {hash:snapshot.contentSha256,deferred:links.length-20,meaning:'All links remain in company collection snapshot; bridge considers first 20 relevant links per source revision.'});
   for(const doc of documents){
    let url;try{url=publicURL(doc.url);if(new URL(url).origin!==new URL(finalURL).origin)throw Error('CROSS_ORIGIN_LINK');}catch(e){reject(source.id,e.message,doc.url??null);continue;}
    const title=doc.title.trim().slice(0,240);if(!title)continue;
    for(const code of sourceCodes){
     const identity={sourceId:source.id,code,sourceURL:finalURL,url,sourceBodySHA256:snapshot.contentSha256,title};
     const id='breaking-candidate-'+key(identity);
     const previous=out.candidates.filter(c=>c.code===code&&c.url===url&&c.id!==id).at(-1);
     const sameTitle=out.candidates.filter(c=>c.code===code&&c.title===title&&c.url!==url).map(c=>c.id);
     append('candidates',{id,...identity,observedAt,importedAt:instant,status:'UNREVIEWED_CANDIDATE',targetStatus:'REGISTRY_LINK_ONLY_REVIEW_REQUIRED',publishedAt:null,publishedDateHint:doc.publishedAt??null,publicationStatus:'UNVERIFIED_DATE_ROLE_AND_TIMEZONE',pageDateMentions:[...(extracted.dateMentions??[])].slice(0,100),bodyRead:!!doc.isPage,bodyReadMeaning:doc.isPage?'Source page fetched; content not fact-verified':'Link extracted only; linked document body not fetched',rawSnapshotArchived:!!snapshot.rawSnapshotArchived,previousCandidateId:previous?.id??null,suspectedDuplicateIds:sameTitle,economicDuplicateConfirmed:false,priceImpact:null,approvedEventId:null,reason:'Publication, legal entity, event phase, correction and economic relevance require source-body review. Page dates are not assigned to this event.'});
    }
   }
  }
 }
 return JSON.stringify(out)===JSON.stringify(breaking)?breaking:out;
}

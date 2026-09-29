// Explicitly reviewed press observations only. Not a scraper or forecast input.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {syncSealedState} from '../lib/sealed-state.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const instant=x=>typeof x==='string'&&/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(x)&&Number.isFinite(Date.parse(x));
const https=x=>{try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
export function applyReviewedBenchmarkResearch(bundle,research,{now=new Date().toISOString()}={}){
 if(!instant(now)||research?.schema!==1||research.code!=='KOSPI'||typeof research.id!=='string'||!research.id.trim()||!Array.isArray(research.rows)||!research.rows.length)throw Error('RESEARCH_CONTRACT_INVALID');
 const at=Date.parse(now),sessions=bundle.input.calendar.sessions;
 const digest=hash(JSON.stringify(research));
 const previous=bundle.atlasBenchmark??{code:'KOSPI',prices:[],collectionLogs:[]};
 if(previous.code!=='KOSPI'||!Array.isArray(previous.prices)||!Array.isArray(previous.collectionLogs))throw Error('BENCHMARK_STATE_INVALID');
 const prior=previous.collectionLogs.find(x=>x.researchId===research.id);
 if(prior&&prior.researchDigest!==digest)throw Error('RESEARCH_ID_CONFLICT');
 const dates=new Set();
 for(const row of research.rows){
  if(row.code!=='KOSPI'||!sessions.includes(row.date)||row.date<'2026-09-17'||row.date>'2026-10-30'||row.date>bundle.input.actualAsOf||dates.has(row.date))throw Error('RESEARCH_DATE_INVALID');
  dates.add(row.date);
  if(typeof row.close!=='number'||!Number.isFinite(row.close)||row.close<=0||row.sourceBodyRead!==true||row.vintageVerified!==false||row.krxLedgerVerified!==false||row.priceVendorDoubleVerified!==false)throw Error('RESEARCH_EVIDENCE_INVALID');
  if(!instant(row.observedAt)||Date.parse(row.observedAt)>at||Date.parse(row.observedAt)<Date.parse(row.date+'T15:30:00+09:00'))throw Error('RESEARCH_OBSERVATION_INVALID');
  const primary=row.sources?.find(s=>s.url===row.source?.url&&s.sourceBodyRead===true);
  if(row.source?.provider!=='PRESS_ORIGINAL_RESEARCH'||!https(row.source.url)||!primary||primary.originalPageRead!==true||!instant(primary.publishedAt)||!instant(primary.observedAt)||Date.parse(primary.observedAt)>Date.parse(row.observedAt)||Date.parse(primary.publishedAt)>Date.parse(primary.observedAt)||Date.parse(primary.publishedAt)<Date.parse(row.date+'T15:30:00+09:00'))throw Error('RESEARCH_SOURCE_INVALID');
  if(typeof primary.evidenceExcerpt!=='string'||!primary.evidenceExcerpt.trim()||!primary.evidenceExcerpt.replaceAll(',','').includes(String(row.close)))throw Error('RESEARCH_EXCERPT_MISSING_CLOSE');
  if(hash(primary.evidenceExcerpt??'')!==primary.excerptSHA256)throw Error('RESEARCH_EXCERPT_CHANGED');
  const old=previous.prices.filter(p=>p.date===row.date);
  if(old.length>1||old.length===1&&old[0].close!==row.close)throw Error('BENCHMARK_CONFLICT_KEEP_EXISTING:'+row.date);
 }
 if(prior)return bundle;
 const next=structuredClone(bundle),branch=next.atlasBenchmark??{code:'KOSPI',prices:[],collectionLogs:[]};
 let added=0;
 for(const row of research.rows)if(!branch.prices.some(p=>p.date===row.date)){branch.prices.push(structuredClone(row));added++;}
 branch.prices.sort((a,b)=>a.date.localeCompare(b.date));
 branch.status='press_observed';branch.sourceStatus='PRESS_ORIGINAL_CROSSCHECK_NOT_EXCHANGE_LEDGER';branch.actualAsOf=branch.prices.at(-1)?.date??null;
 branch.collectionLogs.push({at:now,researchId:research.id,researchDigest:digest,provider:'PRESS_ORIGINAL_RESEARCH',status:'reviewed_press_import',addedRows:added,reusedRows:research.rows.length-added,attempts:0,naverCollectionSucceeded:false,sourceVerifiedTwice:false,exchangeLedgerVerified:false,reason:'언론 원문에서 확인한 과거 종가를 별도 관측으로 추가 · NAVER 실패 이력 보존'});
 next.atlasBenchmark=branch;
 return syncSealedState(next,{now:new Date(now)});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const file='public/data/atlas.json',raw=await fs.readFile(file,'utf8'),bundle=JSON.parse(raw);
 const research=JSON.parse(await fs.readFile('reports/single-view/benchmark-research.json','utf8'));
 const next=applyReviewedBenchmarkResearch(bundle,research);
 const changed=next!==bundle;
 if(changed){
  for(const k of Object.keys(bundle))if(!['atlasBenchmark','sealedStudy'].includes(k)&&JSON.stringify(bundle[k])!==JSON.stringify(next[k]))throw Error('UNRELATED_DATA_CHANGED:'+k);
  for(const k of ['studies','proofs','errors'])if(JSON.stringify(bundle.sealedStudy[k])!==JSON.stringify(next.sealedStudy[k]))throw Error('SEALED_RECORD_CHANGED:'+k);
  for(const r of bundle.sealedStudy.reports)if(!next.sealedStudy.reports.some(n=>n.id===r.id&&JSON.stringify(n)===JSON.stringify(r)))throw Error('OLD_REPORT_CHANGED');
  if(await fs.readFile(file,'utf8')!==raw)throw Error('CONCURRENT_BUNDLE_CHANGE');
  const temp=file+'.press-import.tmp';await fs.writeFile(temp,JSON.stringify(next),{flag:'wx'});await fs.rename(temp,file);
 }
 const summary={at:new Date().toISOString(),status:changed?'IMPORTED':'UNCHANGED',rows:next.atlasBenchmark.prices.length,previousReports:bundle.sealedStudy.reports.length,reports:next.sealedStudy.reports.length,originalSHA:hash(JSON.stringify(next.original)),forecastsUnchanged:true,naverCollectionSucceeded:false,exchangeLedgerVerified:false};
 await fs.writeFile('reports/single-view/benchmark-import.json',JSON.stringify(summary,null,2));
 console.log(JSON.stringify(summary));
}

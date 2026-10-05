import {verifyStudySeal} from './sealed-manifest.mjs';
import {appendStudyReports} from './daily-score-report.mjs';
import {sha256,stableJSON} from './cycle-math.mjs';

export const emptySealedState=()=>({schema:1,studies:[],reports:[],proofs:[],errors:[]});
const same=(a,b)=>stableJSON(a)===stableJSON(b);
const union=(a=[],b=[])=>[...new Map([...a,...b].map(x=>[stableJSON(x),structuredClone(x)])).values()];
const validBranch=x=>x&&typeof x==='object'&&!Array.isArray(x)&&x.schema===1&&['studies','reports','proofs','errors'].every(k=>Array.isArray(x[k]));
const quarantine=(branch,side)=>({id:sha256({branch,side}),kind:'INVALID_SEALED_BRANCH',side,reason:'Unsupported or malformed branch retained for recovery',unappliedBranch:structuredClone(branch),priorPreserved:true});
const recordValid=(field,item)=>item&&typeof item==='object'&&!Array.isArray(item)&&typeof item.id==='string'&&!!item.id&&(field!=='studies'||verifyStudySeal(item).valid);
/** Preserve both sides of a conflicting import, never replace a sealed study. */
export function mergeSealedState(current,incoming){
 const out=current==null?emptySealedState():validBranch(current)?structuredClone(current):{...emptySealedState(),errors:[quarantine(current,'current')]};
 for(const field of ['studies','reports','proofs']){
  const kept=[];
  for(const item of out[field]){
   if(recordValid(field,item))kept.push(item);
   else out.errors=union(out.errors,[{id:sha256({field,item}),kind:'INVALID_SAVED_RECORD',field,unappliedRecord:structuredClone(item),priorPreserved:true}]);
  }
  out[field]=kept;
 }
 if(!incoming)return out;
 if(!validBranch(incoming)){out.errors=union(out.errors,[quarantine(incoming,'incoming')]);return out;}
 for(const field of ['studies','reports','proofs']){
  out[field]??=[];
  for(const item of incoming[field]??[]){
   const prior=out[field].find(x=>x?.id===item?.id);
   let reason=null;
   if(!item||typeof item!=='object'||typeof item.id!=='string'||!item.id)reason='MISSING_RECORD_ID';
   else if(field==='studies'&&!verifyStudySeal(item).valid)reason='INVALID_STUDY_SEAL';
   else if(prior&&!same(prior,item))reason='CONFLICTING_IMMUTABLE_RECORD';
   if(reason){
    const error={id:sha256({field,reason,item}),kind:'SEALED_IMPORT',field,reason,incoming:structuredClone(item),priorPreserved:true};
    out.errors=union(out.errors,[error]);
   }else if(!prior)out[field].push(structuredClone(item));
  }
 }
 out.errors=union(out.errors,incoming.errors);
 return out;
}
export function syncSealedState(state,{now=new Date(),onFailure=null}={}){
 if(!state.sealedStudy?.studies?.length)return state;
 try{
  const branch=appendStudyReports(state.sealedStudy,state.input,{now:now instanceof Date?now.toISOString():now,benchmark:state.atlasBenchmark});
  return same(branch,state.sealedStudy)?state:{...state,sealedStudy:branch};
 }catch(error){
  const message=String(error?.message??error);onFailure?.(message);
  const record={id:sha256({message,asOf:state.input?.actualAsOf,studyIds:state.sealedStudy.studies.map(s=>s?.id??null)}),kind:'SEALED_SCORE_FAILURE',message,priorPreserved:true};
  const errors=union(state.sealedStudy.errors,[record]);
  return same(errors,state.sealedStudy.errors)?state:{...state,sealedStudy:{...state.sealedStudy,errors}};
 }
}
/** Price corrections carry full immutable collection history; user conflicts stay explicit. */
export function mergeBenchmark(current,incoming,{base=null}={}){
 if(!incoming)return current??null;
 if(!current)return structuredClone(incoming);
 const out=structuredClone(current);out.collectionLogs=union(current.collectionLogs,incoming.collectionLogs);
 out.revisions=union(current.revisions,incoming.revisions);
 out.conflicts=union(current.conflicts,incoming.conflicts);
 out.prices??=[];
 for(const row of incoming.prices??[]){
  const old=out.prices.find(p=>p.date===row.date);
  if(!old)out.prices.push(structuredClone(row));
  else if(!same(old,row)){
   const prior=base?.prices?.find(p=>p.date===row.date);
   if(prior&&same(old,prior)){
    out.prices[out.prices.indexOf(old)]=structuredClone(row);
    continue;
   }
   if(old.close===row.close&&old.quality===row.quality)continue;
   // Existing local observations are never silently overwritten by release data.
   const conflict={date:row.date,current:old,incoming:row,reason:'BENCHMARK_IMPORT_CONFLICT'};
   out.conflicts=union(out.conflicts,[conflict]);
  }
 }
 out.prices.sort((a,b)=>a.date.localeCompare(b.date));
 return out;
}

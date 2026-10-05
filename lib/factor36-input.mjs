import{factorValue,FEATURE_FACTORS,FEATURE_NAMES,FACTOR36_POLICY}from'./factor36.mjs';
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const key=r=>JSON.stringify([r.factorId,r.scope,r.code??'',r.sector??'',r.scope==='index'?[r.indexId,[...(r.codes??[])].sort(),canonical(r.membership)]:null,r.date,r.vintageId]);
// No zero imputation or retrospective vintage invention. A shorter *continuous* history is eligible only if the original 160+40+60 requirement still holds.
export function externalDesign(records,asset,panel,baseRows,informationCutoff){
 const ids=[...new Set(records.map(r=>r.factorId))].filter(id=>!['F11','F35','F36'].includes(id)).sort(),candidates=[],rejected=[];
 const minimum=FACTOR36_POLICY.minimumTrain+FACTOR36_POLICY.innerDays+FACTOR36_POLICY.holdoutDays;
 const positions=new Map(panel.dates.map((date,j)=>[date,j]));
 for(const id of ids){
  const current=factorValue(records,id,asset,panel.dates.at(-1),informationCutoff);
  const series=baseRows.map(r=>{const j=positions.get(r.date),date=panel.dates[j-1];return date?factorValue(records,id,asset,date,date+'T16:00:00+09:00'):null;});
  if(!current){rejected.push({factorId:id,reason:'현재 시점·대상·출처·빈티지 검증 원자료 부족',code:'CURRENT_INPUT_MISSING'});continue;}
  let first=0;for(let j=0;j<series.length;j++)if(!series[j]||series[j].unit!==current.unit)first=j+1;
  const usable=series.slice(first),trainingRows=baseRows.slice(first).filter(r=>r.date<FACTOR36_POLICY.trainingBefore).length;
  if(trainingRows<minimum){rejected.push({factorId:id,reason:'연속 학습160·선택40·평가60거래일 또는 동일 단위 원자료 부족',code:'CONTIGUOUS_HISTORY_SHORT',eligibleTrainingRows:trainingRows,requiredRows:minimum});continue;}
  if(id==='FOMO'&&[current,...usable].some(r=>r.scope!=='company'||r.coreEvidenceVerified!==true)){rejected.push({factorId:id,reason:'FOMO 핵심 관측 근거 부족',code:'FOMO_CORE_UNVERIFIED'});continue;}
  const events=[...new Set(usable.map(r=>r.economicEventId).filter(Boolean))];
  candidates.push({factorId:id,current,series,first,events});
 }
 // Reject both overlapping economic representations instead of arbitrarily keeping the first input row.
 const selectedCandidates=candidates.filter(c=>{const overlapping=candidates.filter(other=>other!==c&&other.events.some(e=>c.events.includes(e))).map(other=>other.factorId);if(overlapping.length){rejected.push({factorId:c.factorId,reason:'다른 수치 항과 경제 사건 중복 · 결합 근거 필요',code:'DUPLICATE_ECONOMIC_EXPOSURE',overlapping});return false;}return true;});
 const first=selectedCandidates.reduce((n,c)=>Math.max(n,c.first),0),rows=baseRows.slice(first);
 const selected=selectedCandidates.map(c=>({factorId:c.factorId,current:structuredClone(c.current),values:c.series.slice(first).map(r=>r.value),byTargetDate:Object.fromEntries(baseRows.map((r,j)=>[r.date,c.series[j]?.value??null])),events:c.events,uniqueObservations:new Set(c.series.slice(first).map(r=>key(r))).size,independentObservationCount:null}));
 return{selected,rejected:rejected.sort((a,b)=>a.factorId.localeCompare(b.factorId)),history:{method:'continuous_common_suffix_without_imputation',originalRows:baseRows.length,usedRows:rows.length,first:rows[0]?.date??null,last:rows.at(-1)?.date??null,removedPrefixRows:first,minimumTrainingSelectionEvaluationRows:minimum,strictPointInTimeRequired:true},featureFactors:[...FEATURE_FACTORS,...selected.map(x=>x.factorId)],featureNames:[...FEATURE_NAMES,...selected.map(x=>x.factorId+' 검증 입력')],rows:rows.map((r,j)=>({...r,x:[...r.x,...selected.map(s=>s.values[j])]}))};
}
export function mergeFactorRecords(previous,incoming,{expectedHash,actualHash,at}){
 if(expectedHash!==actualHash)throw Error('FACTOR_REVISION_CONFLICT');
 const next=structuredClone(previous.records??[]),changes=[];
 for(const supplied of incoming){const r=structuredClone(supplied);if(r.scope==='index')r.codes=[...new Set(r.codes??[])].sort();const i=next.findIndex(x=>key(x)===key(r));if(i>=0){if(JSON.stringify(canonical(next[i]))!==JSON.stringify(canonical(r)))throw Error('FACTOR_VALUE_CONFLICT');continue;}let before=null;if(r.supersedesVintageId){before=next.find(p=>p.factorId===r.factorId&&p.scope===r.scope&&p.code===r.code&&p.sector===r.sector&&p.indexId===r.indexId&&p.date===r.date&&p.vintageId===r.supersedesVintageId);if(!before||Date.parse(before.publishedAt)>=Date.parse(r.publishedAt)||Date.parse(before.observedAt)>Date.parse(r.observedAt))throw Error('FACTOR_CORRECTION_PREDECESSOR_MISSING_OR_INVALID');}next.push(r);changes.push({at,before:structuredClone(before),after:structuredClone(r)});}
 return{schema:'atlas-factor36-records-1',records:next,revisions:[...structuredClone(previous.revisions??[]),...changes]};
}

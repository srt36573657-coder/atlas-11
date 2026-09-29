// All user input writes pass through this boundary. Imported journals cannot
// replace the already recorded history or backdate an observed change.
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function journalInputChange(before,incoming,{now=new Date().toISOString()}={}){
 if(!Number.isFinite(Date.parse(now)))throw Error('Invalid input observation time');
 const next=structuredClone(incoming);
 next.priceRevisions=structuredClone(before.priceRevisions??[]);
 next.newsRevisions=structuredClone(before.newsRevisions??[]);
 for(const asset of next.assets){
  const old=before.assets.find(a=>a.code===asset.code);
  for(const date of new Set([...(old?.prices??[]),...asset.prices].map(p=>p.date))){
   const prior=old?.prices.find(p=>p.date===date)??null;
   const after=asset.prices.find(p=>p.date===date)??null;
   if(same(prior,after))continue;
   next.priceRevisions.push({code:asset.code,date,before:prior?.close??null,after:after?.close??null,beforeRow:structuredClone(prior),afterRow:structuredClone(after),at:now,provider:'USER_INPUT'});
  }
 }
 for(const id of new Set([...(before.events??[]),...(next.events??[])].map(e=>e.id))){
  const previous=(before.events??[]).filter(e=>e.id===id),current=(next.events??[]).filter(e=>e.id===id);
  if(same(previous,current))continue;
  if(previous.length>1||current.length>1)throw Error('상충하는 동일 ID 사건은 일괄 입력으로 수정할 수 없습니다: '+id);
  const prior=previous[0]??null,after=current[0]??null;
  if(after){after.availableAt=now;after.availabilityBasis='사용자 입력 변경 관측 시각';}
  next.newsRevisions.push({id,before:structuredClone(prior),after:structuredClone(after),at:now,reason:'사용자 입력 변경'});
 }
 // Avoid fabricating absent empty journals on an otherwise unchanged input.
 if(!next.priceRevisions.length&&!Object.hasOwn(before,'priceRevisions'))delete next.priceRevisions;
 if(!next.newsRevisions.length&&!Object.hasOwn(before,'newsRevisions'))delete next.newsRevisions;
 const changed=!same(before,next);
 if(changed)next.informationAsOf=now;
 return {input:next,changed};
}

// Read-only comparison of saved values. Never changes a forecast or adds an energy bonus.
import {calendarDates} from './daily-explanation.mjs';
import {appliesTo} from './news-scope.mjs';
export const EQUAL_START=10000;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function normalizePrice(price,base){return finite(price)&&price>0&&finite(base)&&base>0?EQUAL_START*price/base:null;}
export function comparisonSeries({input,version}){
 const dates=calendarDates(input.origin,input.end),sessions=new Set(input.calendar.sessions);
 if(input.assets.length!==52||new Set(input.assets.map(a=>a.code)).size!==52)throw Error('52 unique original stocks required');
 return input.assets.map(source=>{
  const asset=version.assets.find(a=>a.code===source.code),baseRows=source.prices.filter(p=>p.date===input.origin),base=baseRows.length===1&&baseRows[0].quality!=='conflict'?baseRows[0].close:null;
  const actual=new Map(),forecast=new Map();
  for(const p of source.prices)if(p.date<=input.actualAsOf){if(actual.has(p.date))actual.set(p.date,null);else actual.set(p.date,p.quality==='conflict'?null:p.close);}
  for(const p of asset?.rows??[]){if(forecast.has(p.date))forecast.set(p.date,null);else forecast.set(p.date,p.p50);}
  let previous=null;
  const rows=dates.map(date=>{
   if(!sessions.has(date))return{date,value:previous?.value??null,kind:'holiday',valueDate:previous?.date??null,referenceKind:previous?.kind??null};
   const kind=date<=input.actualAsOf?'actual':'forecast',price=kind==='actual'?actual.get(date):forecast.get(date),value=normalizePrice(price,base);
   const row={date,value,kind:value===null?'missing':kind,valueDate:value===null?null:date};previous=row;return row;
  });
  return{code:source.code,name:source.name,sector:source.sector,base,rows,asset,source};
 });
}
export function rankAt(series,date){
 const list=series.map(a=>({...a,...a.rows.find(r=>r.date===date)})).sort((a,b)=>(b.value??-Infinity)-(a.value??-Infinity)||a.code.localeCompare(b.code));
 let rank=null,prior=null;
 return list.map((a,i)=>{if(a.value!==null){if(prior===null||Math.abs(a.value-prior)>1e-8)rank=i+1;prior=a.value;}return{...a,rank:a.value===null?null:rank,return:a.value===null?null:a.value/EQUAL_START-1};});
}
export function newsEnergy(asset,source,date,end){
 const events=(asset?.news??[]).filter(n=>n.date>=date&&n.date<=end&&n.scope&&appliesTo(n,source)).map(n=>{
  const wave=asset.waveModel?.events.find(e=>e.id===n.id&&e.status==='exploratory');
  const impact=n.impact,measured=n.used===true&&impact?.method==='paired_terminal_wasserstein_1'&&finite(impact.distributionChangePP)&&impact.distributionChangePP>=0;
  return{id:n.id,title:n.name,date:n.date,scope:n.route??n.scope.type,used:n.used===true,energy:wave?100*wave.energy:measured?impact.distributionChangePP:null,direction:wave?100*wave.netLogResponse:measured&&finite(impact.medianChangePP)?impact.medianChangePP:null,method:wave?'wave_kernel':'wasserstein',reason:n.reason??'근거 미확보',sources:(n.sources??[]).filter(s=>{try{return ['http:','https:'].includes(new URL(s.url).protocol);}catch{return false;}}),sampleCount:n.sampleCount??null,causal:false};
 }).sort((a,b)=>(b.energy??-Infinity)-(a.energy??-Infinity)||a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 // Never sum correlated per-event counterfactuals.
 return{events,energy:events.find(e=>e.energy!==null)?.energy??null,meaning:asset.waveModel?'남은 사건 중 최대 3일 관측 반응 총 크기(로그수익률 %p); 상승률·인과효과 아님':'남은 사건 중 최대 분포 변화(%p); 모형 내 비교이며 상승률·인과효과가 아님',trustProbability:null};
}
export function nextRaceIndex(index,length){return Math.min(index+1,length-1);}

// Ranking movement is an arithmetic decomposition, never a causal news attribution.
export function rankMovement(series,date,previousDate,code){
 const current=rankAt(series,date),previous=rankAt(series,previousDate),a=current.find(a=>a.code===code),b=previous.find(a=>a.code===code);
 if(!a||!b||a.value===null||b.value===null)return{rankChange:null,ownChange:null,ownComponent:null,otherComponent:null};
 const rivals=current.filter(x=>x.code!==code&&x.value!==null&&previous.some(y=>y.code===x.code&&y.value!==null));
 const B=new Map(previous.map(x=>[x.code,x]));let own=0,other=0;
 const ahead=(x,y)=>x>y+1e-8?1:0;
 for(const x of rivals){const y=B.get(x.code);const f00=ahead(y.value,b.value),f10=ahead(y.value,a.value),f01=ahead(x.value,b.value),f11=ahead(x.value,a.value);own+=((f00-f10)+(f01-f11))/2;other+=((f00-f01)+(f10-f11))/2;}
 return{rankChange:b.rank-a.rank,ownChange:a.value/b.value-1,ownComponent:own,otherComponent:other,comparableRivals:rivals.length,unexplainedRankChange:(b.rank-a.rank)-own-other,method:'two_order_shapley_pairwise_rank_changes',causal:false};
}
export function raceDates(input){return input.calendar.sessions.filter(d=>d>=input.origin&&d<=input.end);}
export function raceKeyframes(series,dates,code){
 return dates.flatMap((date,i)=>{if(!i)return[];const now=rankAt(series,date),before=rankAt(series,dates[i-1]),a=now.find(a=>a.code===code),p=before.find(a=>a.code===code);const news=(a?.asset?.news??[]).filter(n=>n.date===date);const reasons=[];
 if(now[0]?.value!==null&&before[0]?.value!==null&&now[0]?.code!==before[0]?.code&&now[0]?.rank===1&&now[1]?.rank!==1&&before[1]?.rank!==1)reasons.push('선두 교체');
 if(a?.rank!=null&&p?.rank!=null&&Math.abs(a.rank-p.rank)>=5)reasons.push('선택 종목 5계단 이상 이동');
 if(news.length)reasons.push('선택 종목 연결 뉴스');
 return reasons.length?[{date,index:i,reasons,eventIds:news.map(n=>n.id)}]:[];
 });
}
export function closeRace(rows,code,threshold=.001){
 const index=rows.findIndex(r=>r.code===code),a=rows[index];if(!a||a.value===null)return null;
 const above=index>0?rows[index-1]:null,below=rows[index+1];
 const neighbor=[above,below].filter(r=>r?.value!==null&&r?.value!==undefined).sort((x,y)=>Math.abs(x.value-a.value)-Math.abs(y.value-a.value))[0];
 return{above:above?.value!=null?{code:above.code,name:above.name,gap:Math.max(0,above.value-a.value)}:null,near:neighbor&&Math.abs(neighbor.value/a.value-1)<=threshold?{code:neighbor.code,name:neighbor.name,gap:Math.abs(neighbor.value-a.value)}:null,threshold,meaning:'fixed_value_gap_display_rule_not_statistical_rank_stability'};
}

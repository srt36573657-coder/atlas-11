import { DAILY_VIEW } from './daily-view-contract.mjs';
// Importance is a display rule, not a probability or a causal claim.
const major=new Set(['FOMC','BOK','CPI','PPI','JOBS','JOLTS']);
export function buildStory(version, code) {
 const grouped=new Map();
 for(const e of version.eventGate.accepted){
  const related=version.assets.filter(a=>!code||a.code===code).map(a=>{
   const p=a.news.find(p=>p.id===e.id&&(code||p.used));if(!p)return null;
   if(a.waveModel){const w=a.waveModel.events.find(e=>e.id===p.id);return {code:a.code,name:a.name,profile:p,importance:w?.energy??0};}
   const mean=p.selection.rawMean,variance=p.samples.reduce((s,x)=>s+(x.value-mean)**2,0)/Math.max(1,p.samples.length-1),
    importance=(Math.abs(p.selection.mu)+Math.sqrt(variance))/Math.max(a.training.sigma,1e-8);
   return {code:a.code,name:a.name,profile:p,importance};
  }).filter(Boolean).sort((a,b)=>b.importance-a.importance||a.code.localeCompare(b.code));
  const score=related.length?related[Math.floor((related.length-1)*0.2)].importance:0;
  const important=related.length>0&&(major.has(e.kind)||score>=1||related.some(r=>!r.profile.used));
  if(!important)continue;
  const item={event:e,related:related.slice(0,3),count:related.length,score,
   reason:related.some(r=>!r.profile.used)?'계산을 유보한 뉴스의 근거 확인':major.has(e.kind)?'이 종목에 연결된 주요 경제 발표':'이 종목의 과거 반응이 평소 하루 변동폭 이상'};
  if(!grouped.has(e.targetDate))grouped.set(e.targetDate,{date:e.targetDate,items:[]});
  grouped.get(e.targetDate).items.push(item);
 }
 return [...grouped.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
export function nextPlayback(dates,date,stops){
 const i=dates.findIndex(d=>d>date);if(i<0)return {date,ended:true,stop:null};
 const next=dates[i];return {date:next,ended:false,stop:stops.find(s=>s.date===next)??null};
}
export function displayRow(asset,input,date){
 const source=input.assets.find(a=>a.code===asset.code),base=source?.prices.find(p=>p.date===input.origin)?.close??asset.originPrice,
  predicted=asset.rows.find(r=>r.date===date),actual=source?.prices.find(p=>p.date===date)?.close;
 if(!input.calendar.sessions.includes(date)) {
  const referenceDate=input.calendar.sessions.filter(d=>d>=input.origin&&d<date).at(-1);
  if(!referenceDate)return {date,p50:null,displayReturn:null,kind:'휴장 · 자료 없음',probUp:null,isHoliday:true};
  const reference=displayRow(asset,input,referenceDate);
  return {...reference,date,referenceDate,isHoliday:true,kind:'휴장 · '+reference.kind,probUp:null};
 }
 if(actual&&date<=input.actualAsOf)return {date,p50:actual,displayReturn:actual/base-1,kind:'실제',probUp:null};
 if(predicted)return {...predicted,displayReturn:predicted.p50/base-1,kind:predicted.anchor?'실제':'예측'};
 if(actual)return {date,p50:actual,displayReturn:actual/base-1,kind:'실제',probUp:null};
 return {date,p50:null,displayReturn:null,kind:'자료 없음',probUp:null};
}

export const newPlayer = date => ({date,playing:false,speed:DAILY_VIEW.defaultSpeedMs,stop:null,session:false});
export function advancePlayer(player,dates,story) {
 if(!player.playing||player.stop)return player;
 const next=nextPlayback(dates,player.date,story);
 return {...player,date:next.date,stop:next.stop,playing:!next.ended&&!next.stop&&next.date!==dates.at(-1),session:!!next.stop||(!next.ended&&next.date!==dates.at(-1))};
}

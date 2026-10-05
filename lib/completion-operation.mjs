import {createHash} from 'node:crypto';
import {journalInputChange} from './input-revisions.mjs';
import {scoreWave} from './wave-score.mjs';
export const contentHash = value => createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
export function operationWindow(input, now=new Date().toISOString()) {
  if(!Number.isFinite(Date.parse(now))) throw Error('INVALID_CLOCK');
  const local=new Date(Date.parse(now)+9*3600000).toISOString(),day=local.slice(0,10);
  const afterClose=local.slice(11,16)>='16:00',session=input.calendar.sessions.includes(day);
  const cutoff=input.calendar.sessions.filter(d=>d<day||(d===day&&afterClose)).at(-1)??null;
  return {day,afterClose,session,cutoff,ended:day>input.end,notStarted:day<input.origin,eligible:day>=input.origin&&day<=input.end&&session&&afterClose};
}
export function mergeObservedPrices(input, observations, {now=new Date().toISOString(),expectedHash}={}) {
  if(expectedHash!==contentHash(input))throw Error('INPUT_VERSION_CONFLICT');
  const next=structuredClone(input),window=operationWindow(input,now),validCodes=new Set(input.assets.map(a=>a.code)),sessions=new Set(input.calendar.sessions),freshCodes=new Set();
  if(window.ended)throw Error('PERIOD_ENDED');
  const seenQuotes=new Map();
  for(const o of observations){
    if(!validCodes.has(o.code))throw Error('PRICE_CODE_OR_DUPLICATE');
    if(!/^https:\/\//.test(o.sourceUrl??'')||!/^[a-f0-9]{64}$/i.test(o.rawHash??'')||!Number.isFinite(Date.parse(o.observedAt))||Date.parse(o.observedAt)>Date.parse(now))throw Error('PRICE_PROVENANCE');
    const asset=next.assets.find(a=>a.code===o.code),rows=new Map(asset.prices.map(p=>[p.date,p])),incoming=new Map();
    for(const p of o.rows??[]){
      if(!sessions.has(p.date)||p.date>window.cutoff)throw Error('PRICE_NOT_COMPLETED_SESSION');
      if(![p.open,p.high,p.low,p.close,p.volume].every(Number.isFinite)||p.close<=0||p.volume<0)throw Error('PRICE_NUMERIC');
      const suspended=p.open===0&&p.high===0&&p.low===0&&p.volume===0;
      if(!suspended&&(p.low<=0||p.high<p.low||p.open<p.low||p.open>p.high||p.close<p.low||p.close>p.high))throw Error('PRICE_OHLC');
      const key=o.code+':'+p.date,seen=seenQuotes.get(key);if(seen&&['open','high','low','close','volume','turnover'].some(k=>seen[k]!=null&&p[k]!=null&&seen[k]!==p[k]))throw Error('PRICE_CONFLICT');const combined={...seen,...p};seenQuotes.set(key,combined);incoming.set(p.date,combined);
    }
    for(const [date,p]of incoming){
      const existing=rows.get(date),same=existing&&['open','high','low','close','volume','turnover'].every(k=>existing[k]===p[k]);
      if(same)continue;
      rows.set(date,{...p,quality:'single_source',sourceUrl:o.sourceUrl,rawHash:o.rawHash,observedAt:o.observedAt,adjustmentsVerified:o.adjustmentsVerified===true});
    }
    asset.prices=[...rows.values()].sort((a,b)=>a.date.localeCompare(b.date));
    if(incoming.has(window.cutoff))freshCodes.add(o.code);
  }
  const common=next.calendar.sessions.filter(d=>d<=window.cutoff&&next.assets.every(a=>a.prices.some(p=>p.date===d&&p.close>0&&p.quality!=='conflict'))).at(-1);
  if(common)next.actualAsOf=common;
  const result=journalInputChange(input,next,{now});
  for(const r of result.input.priceRevisions?.slice(input.priceRevisions?.length??0)??[])r.provider='REVIEWED_COLLECTOR';
  return {...result,freshCodes:[...freshCodes].sort(),actualAsOf:result.input.actualAsOf,retainedStoredClose:result.input.actualAsOf!==window.cutoff};
}
export function dailyScoreRecord(version,input,now=new Date().toISOString()) {
  const score=scoreWave(version,input),byDate=score.dates.map(date=>{
    const rows=score.rows.filter(r=>r.date===date&&r.actual!==null),n=rows.length;
    return {date,stocks:n,correct:rows.filter(r=>r.matched).length,wrong:rows.filter(r=>!r.matched).length,
      hitRate:n?rows.filter(r=>r.matched).length/n:null,meanAbsoluteError:n?rows.reduce((s,r)=>s+Math.abs(r.errorRate),0)/n:null,
      coverage:n?rows.filter(r=>r.covered).length/n:null,intervalScore:n?rows.reduce((s,r)=>s+r.intervalScore,0)/n:null,
      brier:n?rows.reduce((s,r)=>s+r.brier,0)/n:null,
      commonDirectionFraction:n?Math.max(...['up','flat','down'].map(k=>rows.filter(r=>r.direction===k).length))/n:null};
  });
  return {schema:'atlas-completion-daily-score-1',id:contentHash({forecastId:version.id,rows:score.rows}),observedAt:now,...score,byDate,independentDateCount:byDate.length,stockRowsAreIndependent:false,causalExplanationEstablished:false};
}

// A newly issued forecast starts its own score record. The preceding score is retained.
export function scorePublicationPair(previous,current,input,now=new Date().toISOString()) {
  if(!previous?.id||!current?.id)throw Error('PUBLICATION_ID_REQUIRED');
  const retained=dailyScoreRecord(previous,input,now);
  return {retained,current:current.id===previous.id?retained:dailyScoreRecord(current,input,now)};
}

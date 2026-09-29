import {journalInputChange} from './input-revisions.mjs';
import {rollingHash} from './rolling-operation.mjs';
export function mergeReviewedSessionPrices(input,proposal,{expectedHash,now=new Date().toISOString(),verifiedHashes=[]}={}){
 if(expectedHash!==rollingHash(input))throw Error('INPUT_VERSION_CONFLICT');
 if(proposal.schema!=='atlas-reviewed-session-prices-1'||proposal.basis!=='KRX_REGULAR'||proposal.conflicts?.length)throw Error('REVIEW_CONFLICT');
 if(!Number.isFinite(Date.parse(now))||Date.parse(proposal.observedAt)>Date.parse(now))throw Error('FUTURE_OBSERVATION');
 const hashes=new Set(verifiedHashes),next=structuredClone(input),seen=new Set(),sessions=new Set(input.calendar.sessions);
 for(const row of proposal.rows){
  const a=next.assets.find(a=>a.code===row.code),key=row.code+':'+row.date;
  if(!a||seen.has(key)||!sessions.has(row.date)||row.date>proposal.date)throw Error('ROW_IDENTITY');seen.add(key);
  if(Date.parse(now)<Date.parse(row.date+'T15:30:00+09:00')||!Number.isFinite(row.close)||row.close<=0)throw Error('ROW_NOT_FINAL');
  const url=new URL(row.sourceUrl);if(url.protocol!=='https:'||url.hostname!=='stock.mk.co.kr'||!hashes.has(row.rawHash))throw Error('RAW_EVIDENCE');
  const old=a.prices.find(p=>p.date===row.date);
  const updated={date:row.date,close:row.close,quality:'single_source',priceBasis:'KRX_REGULAR',sourceUrl:row.sourceUrl,rawHash:row.rawHash,observedAt:proposal.observedAt,adjustmentsVerified:false,finalClose:true,finalizedAt:proposal.observedAt,finalitySourceUrl:row.sourceUrl,finalityBasis:'reviewed dated regular-session market board/history; raw snapshots retained'};
  // Never combine a regular close with an old after-market OHLC or volume.
  for(const k of ['open','high','low','volume'])if(Number.isFinite(row[k]))updated[k]=row[k];
  if(updated.volume!=null&&updated.volume<0)throw Error('INVALID_VOLUME');
  if(['open','high','low'].every(k=>updated[k]!=null)&&!(updated.low>0&&updated.low<=Math.min(updated.open,updated.close)&&updated.high>=Math.max(updated.open,updated.close)))throw Error('INVALID_OHLC');
  if(old&&old.priceBasis===updated.priceBasis&&old.close===updated.close&&old.rawHash===updated.rawHash)continue;
  a.prices=a.prices.filter(p=>p.date!==row.date).concat(updated).sort((x,y)=>x.date.localeCompare(y.date));
 }
 if(!next.assets.every(a=>a.prices.some(p=>p.date===proposal.date&&p.priceBasis==='KRX_REGULAR')))throw Error('CURRENT_52_INCOMPLETE');
 next.actualAsOf=proposal.date;
 next.priceBasisReview={asOf:proposal.date,observedAt:proposal.observedAt,currentRegularCloseStocks:next.assets.length,historyCompletelyRepaired:false,reason:'Only directly observed dates corrected; earlier session basis remains unverified. Do not treat prior backtests as certification.'};
 const result=journalInputChange(input,next,{now});
 for(const r of result.input.priceRevisions.slice(input.priceRevisions?.length??0))r.provider='REVIEWED_MK_REGULAR_SESSION';
 return result;
}

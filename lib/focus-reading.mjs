// Display-only comparison: no fitting, scoring, forecast mutation or probability.
export function focusReading({asset,input,version,date}) {
 const source=input.assets.find(a=>a.code===asset.code);
 const valid=(source?.prices??[]).filter(p=>p.date<=input.actualAsOf&&p.close>0&&Number.isFinite(p.close)&&p.quality!=='conflict');
 const exact=valid.filter(p=>p.date===date);
 const conflicting=exact.length>1&&new Set(exact.map(p=>p.close)).size>1;
 const actual=conflicting?null:exact[0]?.close??null;
 const rows=asset.rows.filter(r=>r.date===date);
 const model=rows.length===1&&Number.isFinite(rows[0].p50)&&rows[0].p50>0?rows[0].p50:null;
 const isSession=input.calendar.sessions.includes(date);
 const anchor=date===version.origin;
 const comparable=isSession&&!anchor&&actual!==null&&model!==null;
 return {date,model,anchor,actual:isSession?actual:null,comparable,difference:comparable?actual-model:null,
  differenceRate:comparable?actual/model-1:null,
  status:!isSession?'HOLIDAY':conflicting?'CONFLICT':anchor?'ANCHOR':actual===null?'AWAITING_ACTUAL':model===null?'NO_SAVED_FORECAST':'OBSERVED_COMPARISON',
  latestActualDate:valid.map(p=>p.date).sort().at(-1)??null,accuracyProbability:null};
}

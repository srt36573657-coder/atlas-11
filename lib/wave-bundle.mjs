// A view consumes forecast AND its own input snapshot atomically; never a saved-device input.
export function validateWaveBundle(b){
 const c=b?.candidate,i=b?.displayContext?.input;
 if(b?.schema!=='atlas-news-wave-1'||!c||!i||c.assets?.length!==52||i.assets?.length!==52)throw Error('새 전망과 계산 자료가 한 묶음으로 필요합니다.');
 const codes=i.assets.map(a=>a.code).sort(),forecast=c.assets.map(a=>a.code).sort();
 if(new Set(codes).size!==52||JSON.stringify(codes)!==JSON.stringify(forecast)||i.actualAsOf!==c.origin||b.actualAsOf!==c.origin||i.end!==c.end||i.origin!=='2026-09-17'||i.end!=='2026-10-30')throw Error('새 전망의 종목·기간·종가 기준이 일치하지 않습니다.');
 for(const a of c.assets){const close=i.assets.find(x=>x.code===a.code).prices.find(p=>p.date===c.origin)?.close;if(close!==a.originPrice||!a.rows?.length||a.rows[0].p50!==close)throw Error('새 전망의 출발 종가가 계산 자료와 다릅니다.');}
 if(!b.displayContext.eventGate?.accepted||!b.displayContext.newsCoverage)throw Error('뉴스 기준 자료 누락');
 return b;
}

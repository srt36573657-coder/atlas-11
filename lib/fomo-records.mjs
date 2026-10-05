export const FIELDS=['open','high','low','volume','turnover','retailBuy','retailSell','retailNetBuy','marginBalance','searchIndex'];
const dateOK=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const instant=s=>typeof s==='string'&&/T.*(?:Z|[+-]\d\d:\d\d)$/.test(s)&&Number.isFinite(Date.parse(s));
export function mergeFomoRecords(input,payload,{now=new Date().toISOString(),targetCode=null}={}){
 if(!instant(now)||payload?.schema!=='atlas-fomo-records-2'||!Array.isArray(payload.records)||payload.records.length>100000)throw Error('FOMO v2 원자료 형식을 확인하세요.');
 const next=structuredClone(input),records=next.fomoResearch?.records??[],seen=new Map(records.map(r=>[`${r.code}:${r.date}:${r.field}:${r.field==='searchIndex'?r.queryId:''}`,r]));let added=0;
 for(const item of payload.records){
  const a=next.assets.find(a=>a.code===item.code);
  if(!a||targetCode&&item.code!==targetCode||!dateOK(item.date)||!next.calendar.sessions.includes(item.date)||item.date>next.actualAsOf||!a.prices.some(p=>p.date===item.date&&p.close>0&&p.quality!=='conflict'))throw Error('종목·실제 종가·거래일 불일치');
  if(!FIELDS.includes(item.field)||typeof item.value!=='number'||!Number.isFinite(item.value)||item.field!=='retailNetBuy'&&item.value<0)throw Error('원자료 숫자·필드 오류');
  if(['open','high','low'].includes(item.field)&&item.value<=0||item.field==='searchIndex'&&item.value>100)throw Error('원자료 범위 오류');
  let url;try{url=new URL(item.sourceUrl);}catch{throw Error('출처 URL 필요');}
  if(url.protocol!=='https:'||url.username||url.password)throw Error('HTTPS 공개 출처 필요');
  const availableAt=item.publishedAt??item.availableAt;
  if(!instant(item.observedAt)||!instant(availableAt)||Date.parse(availableAt)>Date.parse(item.observedAt)||Date.parse(item.observedAt)>Date.parse(now)||Date.parse(availableAt)<Date.parse(item.date+'T00:00:00+09:00'))throw Error('미래·불명확한 공개 시각');
  if(!/^[a-f0-9]{64}$/.test(item.snapshotHash??'')||typeof item.unit!=='string'||!item.unit.trim())throw Error('원문 SHA256·단위 필요');
  const expected={open:'KRW',high:'KRW',low:'KRW',volume:'shares',turnover:'KRW',retailBuy:'KRW',retailSell:'KRW',retailNetBuy:'KRW',searchIndex:'relative-100'}[item.field];if(expected&&item.unit!==expected)throw Error('원자료 단위 불일치');
  if(item.field==='searchIndex'&&!(typeof item.queryId==='string'&&item.queryId.trim()))throw Error('검색 요청 척도 식별자 필요');
  const r={code:item.code,date:item.date,field:item.field,value:item.value,unit:item.unit,sourceUrl:url.href,publishedAt:item.publishedAt?new Date(item.publishedAt).toISOString():null,availableAt:new Date(availableAt).toISOString(),publicationBasis:item.publishedAt?'provided_publication_time':'observed_availability_only',observedAt:new Date(item.observedAt).toISOString(),recordedAt:new Date(now).toISOString(),snapshotHash:item.snapshotHash,queryId:item.queryId??null,adjustmentsVerified:item.adjustmentsVerified===true};
  const key=`${r.code}:${r.date}:${r.field}:${r.field==='searchIndex'?r.queryId:''}`,old=seen.get(key);
  if(old){if(old.value!==r.value||old.unit!==r.unit||old.queryId!==r.queryId)throw Error('기존 관측 충돌: '+key);continue;}
  records.push(r);seen.set(key,r);added++;
 }
 // Validate cross-field consistency after an atomic multi-source merge.
 const daily=new Map();for(const r of records){if(r.field==='searchIndex')continue;const k=r.code+':'+r.date;const x=daily.get(k)??{};x[r.field]=r.value;daily.set(k,x);}
 for(const [key,x]of daily){
  if(x.turnover!==undefined){if(['retailBuy','retailSell'].some(k=>x[k]!==undefined&&x[k]>x.turnover)||x.retailNetBuy!==undefined&&Math.abs(x.retailNetBuy)>x.turnover)throw Error('개인 수급이 전체 거래대금 초과: '+key);}
  if(['retailBuy','retailSell','retailNetBuy'].every(k=>x[k]!==undefined)&&Math.abs(x.retailBuy-x.retailSell-x.retailNetBuy)>.01)throw Error('개인 매수·매도·순매수 상충: '+key);
  if(['open','high','low'].every(k=>x[k]!==undefined)){const [code,date]=key.split(':'),close=next.assets.find(a=>a.code===code).prices.find(p=>p.date===date).close;if(x.low>x.high||x.open<x.low||x.open>x.high||close<x.low||close>x.high)throw Error('OHLC 범위 상충: '+key);}
 }
 if(added){next.fomoResearch={...(next.fomoResearch??{}),schema:2,records};next.fomoInformationAsOf=now;}
 return next;
}

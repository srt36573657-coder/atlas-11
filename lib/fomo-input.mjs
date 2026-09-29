// Optional market feature import. Preserves closes and every recorded pre-edit row.
const fields=['retailNetBuy','retailBuy','retailSell','turnover','marginBalance','uniqueCompanyEvents','searchIndex','uniqueAuthors'];
export function mergeFomoInput(input,payload,{now=new Date().toISOString(),targetCode=null}={}){
 if(payload?.schema!=='atlas-fomo-input-1'||!Array.isArray(payload.rows)||payload.rows.length>20000)throw Error('atlas-fomo-input-1 형식의 rows 배열이 필요합니다.');
 const next=structuredClone(input),seen=new Set();
 for(const item of payload.rows){
  if(targetCode&&item.code!==targetCode)throw Error('선택한 종목 이외의 FOMO 자료는 추가할 수 없습니다.');
  const asset=next.assets.find(a=>a.code===item.code),key=item.code+':'+item.date;
  if(!asset||!next.calendar.sessions.includes(item.date)||item.date>next.actualAsOf)throw Error('종목·관측 거래일을 확인하세요. 미래 자료는 입력할 수 없습니다.');
  if(seen.has(key))throw Error('같은 종목·날짜의 중복 입력입니다.');seen.add(key);
  try{if(new URL(item.sourceUrl).protocol!=='https:')throw Error();}catch{throw Error('HTTPS 원자료 출처가 필요합니다.');}
  if(!Number.isFinite(Date.parse(item.observedAt))||Date.parse(item.observedAt)>Date.parse(now)||Date.parse(item.observedAt)<Date.parse(item.date+'T00:00:00+09:00'))throw Error('유효한 관측 시각이 필요합니다.');
  const row=asset.prices.find(p=>p.date===item.date);if(!row||!(row.close>0)||row.quality==='conflict')throw Error('유효한 종가가 있는 거래일에만 보조 자료를 붙입니다.');
  const before=structuredClone(row),f={code:item.code,date:item.date,sourceUrl:item.sourceUrl,observedAt:item.observedAt,recordedAt:now,methodId:item.methodId??null};
  for(const key of fields){if(item[key]!==undefined){if(typeof item[key]!=='number'||!Number.isFinite(item[key])||(key!=='retailNetBuy'&&item[key]<0))throw Error('유효하지 않은 숫자: '+key);f[key]=item[key];}}
  if(!fields.some(k=>Object.hasOwn(f,k)))throw Error('FOMO 관측값이 없습니다.');
  if(['uniqueCompanyEvents','searchIndex','uniqueAuthors'].some(k=>Object.hasOwn(f,k))&&!(typeof f.methodId==='string'&&f.methodId.trim()))throw Error('관심 자료는 중복 제거·검색 조건을 식별하는 methodId가 필요합니다.');
  // A file cannot silently replace user-edited values. Conflicts stay visible.
  if(row.fomo&&Object.entries(f).some(([k,v])=>k!=='recordedAt'&&row.fomo[k]!==v))throw Error(item.code+' '+item.date+' 기존 FOMO 자료와 충돌합니다. 기존 값과 수정 근거를 먼저 확인하세요.');
  if(row.fomo)continue;
  row.fomo=f;(next.priceRevisions??=[]).push({code:asset.code,date:row.date,before:row.close,after:row.close,beforeRow:before,afterRow:structuredClone(row),at:now,provider:'FOMO_SUPPLEMENT'});
 }
 if(payload.rows.length)next.fomoInformationAsOf=now;
 return next;
}

import {mergeCycleData,officialURL,validDay} from './cycle-data.mjs';
import {sha256} from './cycle-math.mjs';
export function parseKrxIndexResponse(body,{date,definitions,observedAt,sourceUrl}){
 const rows=body?.OutBlock_1;
 if(!Array.isArray(rows))throw Error('KRX 응답에 OutBlock_1 배열이 없습니다.');
 return definitions.map(def=>{
  const hits=rows.filter(r=>r.IDX_NM===def.responseName&&String(r.BAS_DD)===date.replaceAll('-',''));
  if(hits.length!==1)throw Error(def.id+' 지수 이름·기준일 응답 불일치');
  const raw=hits[0].CLSPRC_IDX;
  if(typeof raw!=='string'&&typeof raw!=='number')throw Error('KRX 종가 형식 오류');
  const close=Number(String(raw).replaceAll(',',''));
  if(!(close>0)||!Number.isFinite(close))throw Error('KRX 유효 지수 종가 없음');
  const {rows:ignored,responseName,...meta}=def;
  return {...meta,sourceUrl:meta.sourceUrl??sourceUrl,observedAt,rows:[{date,close,sourceUrl,observedAt,vintageVerified:false}]};
 });
}
export async function collectCycleData(input,data,{config={},apiKey='',fetcher=fetch,now=new Date(),maxRequests=12,timeoutMs=10000}={}){
 if(!Number.isInteger(maxRequests)||maxRequests<1||!Number.isFinite(timeoutMs)||timeoutMs<1)throw Error('양의 정수 요청 예산·제한시간 필요');
 const at=now.toISOString(),log={at,status:'not_configured',attempted:0,success:0,failed:0,deferred:0,addedRows:0,partial:true,items:[],newVerifiedVintageRows:0};
 let next=structuredClone(data);
 if(!apiKey){log.exitCode=2;log.reason='KRX_API_KEY 미설정 · 승인된 공식 API 인증키 필요';return {data:next,log,exitCode:2};}
 if(!data.calendar?.sessions?.length||!Array.isArray(config.services)||!config.services.length){log.exitCode=2;log.reason='공식 거래일 목록·승인된 API 명세별 수집 설정 필요';return {data:next,log,exitCode:2};}
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(now);
 const closeTime=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
 const cutoff=closeTime>='16:00'?today:data.calendar.sessions.filter(d=>d<today).at(-1);
 const jobs=[];
 for(const service of config.services){
  if(!officialURL(service.endpoint)||!/^\/svc\/apis\/idx\/[a-z0-9_]+$/.test(new URL(service.endpoint).pathname)||new URL(service.endpoint).search||new URL(service.endpoint).username||new URL(service.endpoint).password)throw Error('승인된 KRX 지수 API HTTPS 명세 주소만 허용합니다.');
  if(!Array.isArray(service.series)||!service.series.length)throw Error('수집 지수 정의 필요');
  const dates=data.calendar.sessions.filter(d=>d>= (service.start??'2014-01-01')&&d<=cutoff).filter(d=>service.series.some(s=>!data.series.find(x=>x.id===s.id)?.rows.some(r=>r.date===d)));
  for(const date of dates)jobs.push({service,date});
 }
 const budget=Math.min(Math.max(1,maxRequests),250),selected=jobs.slice(0,budget);log.deferred=jobs.length-selected.length;
 let circuit=false;
 for(const job of selected){
  if(circuit){log.deferred++;continue;}
  const {service,date}=job,url=new URL(service.endpoint);url.searchParams.set('basDd',date.replaceAll('-',''));
  const item={date,endpoint:service.endpoint,series:service.series.map(s=>s.id),attempts:0};
  let response,body;
  try{
   for(let attempt=0;attempt<2;attempt++){
    item.attempts++;log.attempted++;
    try{
     response=await fetcher(url.href,{headers:{AUTH_KEY:apiKey,Accept:'application/json'},signal:AbortSignal.timeout(timeoutMs),redirect:'error'});
     if(!response.ok){const e=Error('HTTP '+response.status);e.status=response.status;throw e;}
     const raw=await response.text();if(raw.length>10000000)throw Error('응답 크기 한도 초과');
     body=JSON.parse(raw);item.responseSHA256=sha256(raw);break;
    }catch(e){
     if([401,403,429].includes(e.status)){circuit=true;throw e;}
     if(attempt===1)throw e;
    }
   }
   const series=parseKrxIndexResponse(body,{date,definitions:service.series,observedAt:at,sourceUrl:service.endpoint});
   const before=next.series.reduce((n,s)=>n+s.rows.length,0);
   next=mergeCycleData(next,{schema:'atlas-cycle-input-1',series},input,{now:at});
   log.addedRows+=next.series.reduce((n,s)=>n+s.rows.length,0)-before;log.success++;item.status='stored';
  }catch(e){log.failed++;item.status='failed';item.error=e.status?'HTTP '+e.status:String(e.message).replaceAll(apiKey,'[redacted]');}
  log.items.push(item);
 }
 log.partial=log.failed>0||log.deferred>0;log.exitCode=log.partial?2:0;log.status=log.partial?'partial':'complete';
 log.reason=log.partial?'마지막 정상 자료 보존 · 남은 날짜는 다음 실행에서 이어 수집':'요청 범위 수집 완료 · 과거 빈티지 검증과는 별개';
 return {data:next,log,exitCode:log.partial?2:0};
}

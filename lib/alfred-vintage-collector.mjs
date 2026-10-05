import{createHash}from'node:crypto';
const allowed=new Set(['DFII10','DEXKOUS']);
const day=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
export function parseVintage(body,{seriesId,vintageDate,observedAt}){
 if(!allowed.has(seriesId)||!day(vintageDate)||!Number.isFinite(Date.parse(observedAt)))throw Error('VINTAGE_REQUEST');
 const parsed=JSON.parse(body);if(parsed.realtime_start!==vintageDate||parsed.realtime_end!==vintageDate||!Array.isArray(parsed.observations)||parsed.offset!==0||parsed.count!==parsed.observations.length)throw Error('VINTAGE_MISMATCH_OR_TRUNCATED');
 const seen=new Set(),rows=[];for(const r of parsed.observations){if(!day(r.date)||r.date>vintageDate||seen.has(r.date)||r.realtime_start!==vintageDate||r.realtime_end!==vintageDate)throw Error('VINTAGE_ROW');seen.add(r.date);if(r.value!=='.'&&!/^-?\d+(?:\.\d+)?$/.test(r.value))throw Error('VINTAGE_VALUE');const value=r.value==='.'?null:Number(r.value);if(value!==null&&!Number.isFinite(value))throw Error('VINTAGE_VALUE');rows.push({date:r.date,value,status:value===null?'provider_missing':'day_vintage_observation'});}
 return{schema:'atlas-alfred-day-vintage-1',seriesId,vintageDate,observedAt,sourceUrl:`https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&realtime_start=${vintageDate}&realtime_end=${vintageDate}`,rawHash:createHash('sha256').update(body).digest('hex'),rows:rows.sort((a,b)=>a.date.localeCompare(b.date)),availableAt:null,availabilityGranularity:'day',intradayAvailabilityVerified:false,approvedForProduction:false};
}
export async function collectVintages({apiKey,dates,now=new Date(),fetcher=globalThis.fetch,onSnapshot=async()=>{},maxRequests=12,timeoutMs=5000}={}){
 if(!Array.isArray(dates)||dates.some(d=>!day(d)||d>now.toISOString().slice(0,10))||!Number.isInteger(maxRequests)||maxRequests<1||maxRequests>30)throw Error('VINTAGE_PLAN');
 const plan=[...new Set(dates)].sort().flatMap(vintageDate=>[...allowed].map(seriesId=>({seriesId,vintageDate})));
 if(!apiKey)return{status:'blocked',exitCode:2,reason:'FRED_API_KEY_MISSING',requests:0,accepted:[],failures:plan.map(x=>({...x,reason:'credential_missing'}))};
 if(plan.length>maxRequests)throw Error('VINTAGE_REQUEST_BUDGET');
 const accepted=[],failures=[];let requests=0;
 for(const request of plan){
  const url=new URL('https://api.stlouisfed.org/fred/series/observations');for(const [k,v]of Object.entries({series_id:request.seriesId,realtime_start:request.vintageDate,realtime_end:request.vintageDate,observation_start:'2023-01-01',file_type:'json',output_type:'1',offset:'0',limit:'100000',api_key:apiKey}))url.searchParams.set(k,v);
  requests++;
  try{const response=await fetcher(url,{signal:AbortSignal.timeout(timeoutMs),redirect:'error'});if(!response.ok){failures.push({...request,reason:'http_error',status:response.status});if([401,403,429].includes(response.status)){for(const pending of plan.slice(requests))failures.push({...pending,reason:'stopped_after_auth_or_rate_limit'});break;}continue;}
   if(Number(response.headers?.get('content-length'))>8000000)throw Error('RESPONSE_TOO_LARGE');
   const chunks=[];let size=0;for await(const part of response.body){size+=part.byteLength;if(size>8000000)throw Error('RESPONSE_TOO_LARGE');chunks.push(Buffer.from(part));}const body=Buffer.concat(chunks).toString('utf8'),observation=parseVintage(body,{...request,observedAt:now.toISOString()});await onSnapshot({body,observation});accepted.push(observation);
  }catch(error){failures.push({...request,reason:['RESPONSE_TOO_LARGE','VINTAGE_REQUEST','VINTAGE_MISMATCH_OR_TRUNCATED','VINTAGE_ROW','VINTAGE_VALUE'].includes(error.message)?error.message:'network_or_parse_or_snapshot_failure'});}
 }
 return{status:failures.length?'partial':'collected_day_vintages',exitCode:failures.length?2:0,requests,accepted,failures,productionApproval:false};
}

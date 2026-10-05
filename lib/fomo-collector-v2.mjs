import {createHash} from 'node:crypto';
import {collectSources52} from './news-collection52.mjs';
import {parseNaver} from './market-data.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
export function fomoRegistry(input){
 const codes=input.assets.map(a=>a.code).sort();if(codes.length!==52||new Set(codes).size!==52)throw Error('Original 52 unique codes required');
 const sources=input.assets.map(a=>{const url=`https://fchart.stock.naver.com/sise.nhn?symbol=${a.code}&timeframe=day&count=500&requestType=0`;return{id:'source:'+sha(url).slice(0,24),url,host:'fchart.stock.naver.com',codes:[a.code],references:[],config:{enabled:true}};});
 return{codes,sources,assets:input.assets.map(a=>({code:a.code,name:a.name,sourceIds:sources.filter(s=>s.codes.includes(a.code)).map(s=>s.id),keywords:[a.name+' 주가',a.code+' 주가']}))};
}
export async function collectFomoV2(input,{now=new Date(),onSnapshot=async()=>{},naverId,naverSecret,fetcher=globalThis.fetch,sourceOptions={}}={}){
 const registry=fomoRegistry(input),records=[],conflicts=[],search=[],nowISO=now.toISOString();
 const price=await collectSources52(registry,{deadlineMs:45000,timeoutMs:5000,maxAttempts:1,perHostConcurrency:2,circuitThreshold:2,...sourceOptions,onSnapshot:async s=>{
  await onSnapshot(s);const code=s.source.codes[0],asset=input.assets.find(a=>a.code===code);
  for(const p of parseNaver(Buffer.from(s.body).toString('utf8'),code,input.actualAsOf,input.calendar.sessions)){
   const old=asset.prices.find(r=>r.date===p.date);if(!old||old.close!==p.close||old.quality==='conflict'){conflicts.push({code,date:p.date,reason:'기존 종가 불일치 또는 없음'});continue;}
   if(!p.open||!p.high||!p.low)continue;
   for(const field of ['open','high','low','volume'])records.push({code,date:p.date,field,value:p[field],unit:field==='volume'?'shares':'KRW',publishedAt:null,availableAt:s.metadata.observedAt,observedAt:s.metadata.observedAt,sourceUrl:s.source.url,snapshotHash:s.metadata.contentSha256,adjustmentsVerified:false});
  }
 }});
 // Credentials remain server-only and never enter snapshots, reports, or ZIPs.
 if(!naverId||!naverSecret){for(const a of registry.assets)search.push({code:a.code,status:'not_configured',reason:'NAVER 데이터랩 API 인증 미설정'});}
 else{
  let failures=0;const sessions=input.calendar.sessions.filter(d=>d<=input.actualAsOf),start=sessions.at(-500)??sessions[0];
  for(let i=0;i<registry.assets.length;i+=5){const group=registry.assets.slice(i,i+5);if(failures>=2){search.push(...group.map(a=>({code:a.code,status:'deferred',reason:'검색 제공자 회로 차단'})));continue;}
   try{
    const body=JSON.stringify({startDate:start,endDate:input.actualAsOf,timeUnit:'date',keywordGroups:group.map(a=>({groupName:a.code,keywords:a.keywords}))});
    const res=await fetcher('https://openapi.naver.com/v1/datalab/search',{method:'POST',redirect:'error',signal:AbortSignal.timeout(8000),headers:{'Content-Type':'application/json','X-Naver-Client-Id':naverId,'X-Naver-Client-Secret':naverSecret},body});
    if(!res.ok)throw Error('HTTP_'+res.status);
    const reader=res.body.getReader(),chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4000000)throw Error('RESPONSE_TOO_LARGE');chunks.push(value);}}finally{await reader.cancel().catch(()=>{});}
    const raw=Buffer.concat(chunks),result=JSON.parse(raw),queryId=sha(body),digest=sha(raw);
    if(!Array.isArray(result.results)||result.results.length!==group.length||new Set(result.results.map(r=>r.title)).size!==group.length)throw Error('SEARCH_ENVELOPE');
    const next=[];for(const a of group){const series=result.results.find(r=>r.title===a.code);if(!series||!Array.isArray(series.data)||!series.data.length)throw Error('SEARCH_TARGET');const seen=new Set();for(const row of series.data){if(seen.has(row.period))throw Error('SEARCH_DUPLICATE');seen.add(row.period);if(typeof row.ratio!=='number'||!Number.isFinite(row.ratio)||row.ratio<0||row.ratio>100)throw Error('SEARCH_RATIO');if(sessions.includes(row.period))next.push({code:a.code,date:row.period,field:'searchIndex',value:row.ratio,unit:'relative-100',queryId,publishedAt:null,availableAt:new Date().toISOString(),observedAt:new Date().toISOString(),sourceUrl:'https://developers.naver.com/docs/serviceapi/datalab/search/search.md',snapshotHash:digest,adjustmentsVerified:false});}}
    await onSnapshot({body:raw,metadata:{contentSha256:digest,queryId,request:JSON.parse(body),observedAt:nowISO,source:'NAVER_DATALAB'}});
    records.push(...next);search.push(...group.map(a=>({code:a.code,status:'observed',queryId})));failures=0;
   }catch(e){failures++;search.push(...group.map(a=>({code:a.code,status:'failed',reason:/^HTTP_\d+$/.test(e.message)?e.message:'NETWORK_OR_INVALID_RESPONSE'})));}
  }
 }
 return{schema:2,at:nowISO,price:price.report,search,flow:registry.assets.map(a=>({code:a.code,status:'import_required',reason:'개별종목 개인 매수·매도·거래대금 공식 원문 및 단위 필요'})),conflicts,payload:{schema:'atlas-fomo-records-2',records},registry,exitCode:2,appliedToOperatingInput:false,reason:'수급 미확보·가격 영향 검증 미완료'};
}

// Optional feature-only collection. Candidate input is separate; saved forecasts never change.
import fs from 'node:fs/promises';
import {parseNaver} from '../lib/market-data.mjs';
const root=new URL('../',import.meta.url),bundle=JSON.parse(await fs.readFile(new URL('public/data/atlas.json',root),'utf8'));
const input=structuredClone(bundle.input),now=new Date().toISOString(),items=[];let failures=0;
for(let i=0;i<input.assets.length;i+=4){
 const group=input.assets.slice(i,i+4);
 if(failures>=4){for(const a of group)items.push({code:a.code,name:a.name,status:'deferred',reason:'같은 제공자 연결 실패 후 회로 차단'});continue;}
 await Promise.all(group.map(async a=>{
  const url=`https://fchart.stock.naver.com/sise.nhn?symbol=${a.code}&timeframe=day&count=400&requestType=0`;
  try{const r=await fetch(url,{signal:AbortSignal.timeout(4000)});if(!r.ok)throw Error('HTTP '+r.status);
   const rows=parseNaver(await r.text(),a.code,input.actualAsOf,input.calendar.sessions);let updated=0,conflicts=0;
   for(const fresh of rows){const old=a.prices.find(p=>p.date===fresh.date);if(!old||old.quality==='conflict'||old.close!==fresh.close){conflicts++;continue;}
    const keys=['open','high','low','volume'];if(!keys.some(k=>old[k]!==fresh[k]))continue;
    const beforeRow=structuredClone(old);for(const key of keys)old[key]=fresh[key];old.featureObservedAt=now;
    (input.priceRevisions??=[]).push({code:a.code,date:old.date,before:old.close,after:old.close,beforeRow,afterRow:structuredClone(old),at:now,provider:'NAVER_FEATURES'});updated++;
   }
   items.push({code:a.code,name:a.name,status:'success',url,updated,conflicts});
  }catch(e){failures++;items.push({code:a.code,name:a.name,status:'failed',url,error:e.message,cause:e.cause?.code??null});}
 }));
}
const report={at:now,assetCount:52,success:items.filter(i=>i.status==='success').length,failed:items.filter(i=>i.status==='failed').length,deferred:items.filter(i=>i.status==='deferred').length,
 updated:items.reduce((s,i)=>s+(i.updated??0),0),appliedToOperatingInput:false,items};
await fs.mkdir(new URL('reports/fomo',root),{recursive:true});
await fs.writeFile(new URL('reports/fomo/collection.json',root),JSON.stringify(report,null,2));
if(report.updated){input.fomoInformationAsOf=now;await fs.writeFile(new URL('reports/fomo/feature-input-candidate.json',root),JSON.stringify(input));}
console.log(JSON.stringify({success:report.success,failed:report.failed,deferred:report.deferred,updated:report.updated}));
process.exit(report.success===52?0:2);

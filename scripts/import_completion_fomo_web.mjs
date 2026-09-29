import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseAlphaExtracted,currentFomoAudit,observationRecords} from '../lib/completion-fomo.mjs';
const input=JSON.parse(await fs.readFile('public/data/atlas.json')).input,dir='reports/completion/raw-fomo',hash=x=>createHash('sha256').update(x).digest('hex'),byCode=new Map(),checks=[];
for(const file of (await fs.readdir(dir)).filter(f=>/^alpha-.*web.*\.json$/.test(f))){
 const raw=await fs.readFile(dir+'/'+file),saved=JSON.parse(raw),text=saved.result.content.filter(c=>c.type==='text').map(c=>c.text).join('\n');
 for(const block of text.split(/\n-{20,}\n/)){
  const url=block.match(/https:\/\/(?:m\.)?alphasquare\.co\.kr\/home(?:\/(?:stock-summary|stock-information))?\?code=\d{6}/)?.[0];if(!url)continue;const code=new URL(url).searchParams.get('code');
  try{const o=parseAlphaExtracted(block,code,{input,sourceUrl:url,observedAt:saved.observedAt});o.snapshotPath=dir+'/'+file;o.snapshotContainerHash=hash(raw);o.citationRef=block.match(/【(turn\w+(?:view|search)\d+)】/)?.[1]??null;
   const a=input.assets.find(a=>a.code===code),compare=o.rows.map(r=>({date:r.date,storedClose:a.prices.find(p=>p.date===r.date)?.close??null,observedClose:r.close,match:a.prices.find(p=>p.date===r.date)?.close===r.close}));
   o.closeComparison=compare;o.allStoredClosesMatch=compare.every(r=>r.match);
   if(!o.allStoredClosesMatch){checks.push({code,sourceUrl:url,status:'quarantined_close_conflict',comparison:compare});continue;}
   const old=byCode.get(code);if(!old||o.rows.at(-1).date>old.rows.at(-1).date||o.rows.at(-1).date===old.rows.at(-1).date&&(o.rows.length>old.rows.length||o.rows.length===old.rows.length&&o.observedAt>old.observedAt))byCode.set(code,o);
   checks.push({code,sourceUrl:url,status:'verified_daily_table',rows:o.rows.length,allStoredClosesMatch:true});
  }catch(e){checks.push({code,sourceUrl:url,status:'unavailable_or_rejected',reason:e.message});}
 }
}
const priceObservations=[...byCode.values()].sort((a,b)=>a.code.localeCompare(b.code)),audit=currentFomoAudit(input,{observations:priceObservations,now:new Date()}),recent=input.calendar.sessions.filter(d=>d<=audit.cutoffDate).slice(-10),report={...audit,priceObservations,priceHistoryCount:priceObservations.length,priceSuccessCount:priceObservations.filter(o=>o.rows.some(r=>r.date===audit.cutoffDate)).length,latestTenSessionCount:priceObservations.filter(o=>recent.every(d=>o.rows.some(r=>r.date===d))).length,priceRowCount:priceObservations.reduce((s,o)=>s+o.rows.length,0),checks,missingCodes:input.assets.filter(a=>!byCode.has(a.code)).map(a=>a.code),staleCodes:priceObservations.filter(o=>!o.rows.some(r=>r.date===audit.cutoffDate)).map(o=>o.code),acceptedAsCurrentObservationOnly:true,pointInTimeTrainingQualified:false,priceEffectEnabled:false,recordsPayload:{schema:'atlas-fomo-records-2',records:observationRecords(priceObservations)},exitCode:priceObservations.length===52&&audit.fullFomoCount===52?0:2};
await fs.writeFile('reports/completion/fomo-price-proposals.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({priceHistoryCount:report.priceHistoryCount,priceSuccessCount:report.priceSuccessCount,latestTenSessionCount:report.latestTenSessionCount,priceRowCount:report.priceRowCount,fullFomoCount:report.fullFomoCount,partialPriceHeatCount:report.partialPriceHeatCount,missing:report.missingCodes,staleCodes:report.staleCodes,exitCode:report.exitCode}));process.exitCode=report.exitCode;

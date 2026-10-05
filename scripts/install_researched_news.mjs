import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {forecast,checkForecast} from '../lib/news-engine.mjs';
import {mergeResearchRelease,researchCoverage} from '../lib/researched-news.mjs';
const b=JSON.parse(fs.readFileSync('public/data/atlas.json')),s=JSON.parse(fs.readFileSync('public/data/researched-news.json'));
if(b.input.newsResearch?.releaseId===s.releaseId){console.log('이미 반영한 조사 자료입니다.');process.exit(0);}
const before=b.candidate,original=JSON.stringify(b.original);
b.input=mergeResearchRelease(b.input,{...b.input,events:s.events,newsResearch:s.research});
b.candidate=forecast(b.input,{origin:before.origin,paths:20000,seed:20260917,informationCutoff:b.input.informationAsOf,live:false});
b.checks=checkForecast(b.candidate,b.input);
if(!b.checks.complete||createHash('sha256').update(JSON.stringify(b.original)).digest('hex')!=='1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca'||JSON.stringify(b.original)!==original)throw Error('원본/계산 검사 실패');
b.priorVersions=[...new Map([...(b.priorVersions??[]),before].map(v=>[v.id,v])).values()];
b.revision++;b.updates.push({type:'official-news-release',at:s.checkedAt,releaseId:s.releaseId,previous:before.id,next:b.candidate.id,originalUnchanged:true});
b.input.newsResearch.assets=researchCoverage(b.input,b.candidate);
for(const [path,data]of [['public/data/atlas.json',b],['public/data/input.json',b.input],['public/downloads/news_research_52.json',b.input.newsResearch],['reports/news_research_52.json',b.input.newsResearch]])fs.writeFileSync(path,JSON.stringify(data));
console.log({id:b.candidate.id,events:b.candidate.eventGate.accepted.length,covered:b.input.newsResearch.assets.filter(r=>r.byScope.company+r.byScope.sector>0).length,newEventsUsed:b.input.newsResearch.assets.reduce((s,r)=>s+r.usedNewEvents,0),rows:b.candidate.rowCount});

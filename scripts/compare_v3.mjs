import fs from 'node:fs/promises';
import {forecast} from '../lib/news-engine-v3.mjs';
const input=JSON.parse(await fs.readFile('public/data/input.json','utf8'));delete input.calibration;
const report=JSON.parse(await fs.readFile('reports/probability_audit.json','utf8'));
const records=JSON.parse(await fs.readFile('reports/probability_folds.json','utf8')),
 origins=[...new Set(records.filter(r=>r.origin>=report.calibration.groups[0].auditStart).map(r=>r.origin))],sessions=input.calendar.sessions,
 old=[];
for(const origin of origins){
 const end=sessions[sessions.indexOf(origin)+27],v=forecast({...input,origin,end},{origin,paths:2000,seed:20260917,informationCutoff:origin+'T16:00:00+09:00'});
 for(const a of v.assets){const prices=new Map(input.assets.find(x=>x.code===a.code).prices.map(p=>[p.date,p.close]));
  for(const r of a.rows.slice(1)){const actual=prices.get(r.date);if(actual)old.push({origin,error:Math.abs(r.p50/actual-1),covered:actual>=r.p10&&actual<=r.p90,brier:(r.probUp-Number(actual>a.originPrice))**2});}
 }
}
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
report.previousModelComparison={model:'atlas-news-3.0.1',origins:origins.length,n:old.length,mae:avg(old.map(r=>r.error)),coverage:avg(old.map(r=>Number(r.covered))),brier:avg(old.map(r=>r.brier)),note:'같은 감사 구간의 이전 모형 비교. 사후 평가이며 통계적 우위가 입증된 것은 아님.'};
for(const p of ['reports/probability_audit.json','public/downloads/probability_audit.json'])await fs.writeFile(p,JSON.stringify(report,null,2));
const b=JSON.parse(await fs.readFile('public/data/atlas.json','utf8'));b.probabilityAudit=report;await fs.writeFile('public/data/atlas.json',JSON.stringify(b));
console.log(JSON.stringify(report.previousModelComparison));

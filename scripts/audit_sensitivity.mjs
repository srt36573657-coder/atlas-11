import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {forecast,MODEL_VERSION} from '../lib/news-engine.mjs';
import {average} from '../lib/audit.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFile(new URL(p,root),'utf8');
const input=JSON.parse(await read('public/data/input.json')),protocol=JSON.parse(await read('reports/audit_protocol.json')),runs=[];
delete input.calibration;
for(const paths of protocol.seedSensitivity.paths)for(const seed of protocol.seedSensitivity.seeds){
  const v=forecast(input,{origin:protocol.seedSensitivity.origin,paths,seed,informationCutoff:input.informationAsOf,createdAt:input.informationAsOf});
  runs.push({paths,seed,id:v.id,assets:v.assets.map(a=>({code:a.code,name:a.name,p50Return:a.score,p10:a.rows.at(-1).p10/a.originPrice-1,p90:a.rows.at(-1).p90/a.originPrice-1,prob:a.rows.at(-1).rawProbUp,rank:v.ranking.find(r=>r.code===a.code).rank}))});
  console.log(JSON.stringify({run:runs.length,paths,seed}));
}
const report={schema:1,method:MODEL_VERSION,createdAt:new Date().toISOString(),runs:runs.length,uniqueOrigins:1,
  note:'시드·경로 수에 따른 수치 민감도 검사. 독립 미래 검증이나 적중 확률이 아님. 유리한 시드를 고르지 않음',
  seedSelection:'20260917 retained before evaluation',inputSHA256:createHash('sha256').update(JSON.stringify(input)).digest('hex'),
  assets:input.assets.map(a=>({code:a.code,name:a.name,byPaths:protocol.seedSensitivity.paths.map(paths=>{const rows=runs.filter(r=>r.paths===paths).map(r=>r.assets.find(x=>x.code===a.code));
    return {paths,seeds:rows.length,medianReturnMin:Math.min(...rows.map(r=>r.p50Return)),medianReturnMax:Math.max(...rows.map(r=>r.p50Return)),probMin:Math.min(...rows.map(r=>r.prob)),probMax:Math.max(...rows.map(r=>r.prob)),rankMin:Math.min(...rows.map(r=>r.rank)),rankMax:Math.max(...rows.map(r=>r.rank))};})})),raw:runs};
report.summary=protocol.seedSensitivity.paths.map(paths=>{const rows=report.assets.map(a=>a.byPaths.find(g=>g.paths===paths));return {paths,meanMedianSpread:average(rows.map(r=>r.medianReturnMax-r.medianReturnMin)),maxMedianSpread:Math.max(...rows.map(r=>r.medianReturnMax-r.medianReturnMin)),meanProbabilitySpread:average(rows.map(r=>r.probMax-r.probMin)),assetsChangingRanks:rows.filter(r=>r.rankMax!==r.rankMin).length};});
for(const p of ['reports/seed_sensitivity.json','public/downloads/seed_sensitivity.json'])await fs.writeFile(new URL(p,root),JSON.stringify(report,null,2));
console.log(JSON.stringify(report.summary));

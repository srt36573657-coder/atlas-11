// A bounded, inspectable job; running this command does not install a server schedule.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const end=JSON.parse(fs.readFileSync('public/data/atlas.json')).input.end;
if(new Date(Date.now()+9*3600000).toISOString().slice(0,10)>end){console.log('기간 종료 · 원본 보존');process.exit(0);}
const env={...process.env};delete env.NODE_TEST_CONTEXT;
const steps=[['scripts/refresh_bundle.mjs',240000],['scripts/collect_factor36.mjs',60000],['scripts/research_factor36.mjs',300000]],results=[];
for(const [script,timeout]of steps){const r=spawnSync(process.execPath,[script],{env,stdio:'inherit',timeout});results.push({script,code:r.status,error:r.error?.message??null});if(r.status!==0&&r.status!==2)break;}
fs.mkdirSync('reports/factor36/refresh',{recursive:true});fs.writeFileSync('reports/factor36/refresh/'+new Date().toISOString().replace(/[:.]/g,'-')+'.json',JSON.stringify({at:new Date().toISOString(),results},null,2));process.exitCode=results.every(r=>r.code===0)?0:2;

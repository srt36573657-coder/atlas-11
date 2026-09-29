// Installs a separate historical-reconstruction study. Never recalculates saved forecasts.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {buildSealedStudy} from '../lib/sealed-path-pair.mjs';
import {sealStudy,verifyStudySeal} from '../lib/sealed-manifest.mjs';
import {emptySealedState,syncSealedState} from '../lib/sealed-state.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const file=new URL('../public/data/atlas.json',import.meta.url);
const raw=await fs.readFile(file,'utf8'),bundle=JSON.parse(raw),before=JSON.stringify(bundle);
const now=new Date();
const study=buildSealedStudy(bundle.input,{now});
const branch=structuredClone(bundle.sealedStudy??emptySealedState());
const code={};
await fs.mkdir(new URL('../reports/sealed-study/implementations/',import.meta.url),{recursive:true});
for(const p of ['lib/sealed-study-policy.mjs','lib/sealed-path-pair.mjs','lib/sealed-manifest.mjs','lib/paired-score.mjs','lib/daily-score-report.mjs','lib/benchmark-score.mjs']){
 const rawCode=await fs.readFile(new URL('../'+p,import.meta.url));code[p]=sha(rawCode);
 await fs.writeFile(new URL('../reports/sealed-study/implementations/'+code[p]+'.mjs',import.meta.url),rawCode);
}
study.provenance={...study.provenance,implementationHashes:code,originalForecast:{id:bundle.original.id,sha256:sha(JSON.stringify(bundle.original)),retrospective:true},source:'preserved_atlas_bundle',liveDeployment:false};
// Code changes create another sealed book rather than silently reusing an old ID.
study.id=`sealed-${study.origin}-${sha(JSON.stringify({base:study.id,code})).slice(0,16)}`;
const prior=branch.studies.find(s=>s.id===study.id);
if(prior&&!verifyStudySeal(prior).valid)throw Error('기존 봉인 무결성 실패: 자동 교체 거부');
if(!prior)branch.studies.push(sealStudy(study));
let next={...bundle,sealedStudy:branch,atlasBenchmark:bundle.atlasBenchmark??{code:'KOSPI',prices:[],collectionLogs:[],status:'NOT_COLLECTED'}};
next=syncSealedState(next,{now});
const old=JSON.parse(before);
for(const key of Object.keys(old))if(!['sealedStudy','atlasBenchmark'].includes(key)&&JSON.stringify(old[key])!==JSON.stringify(next[key]))throw Error('기존 자료 변경 거부: '+key);
if(JSON.stringify(next)!==raw){await fs.writeFile(new URL('../public/data/atlas.next.json',import.meta.url),JSON.stringify(next));await fs.rename(new URL('../public/data/atlas.next.json',import.meta.url),file);}
const installed=next.sealedStudy.studies.find(s=>s.id===study.id);
await fs.mkdir(new URL('../public/downloads/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('../public/downloads/ATLAS_Sealed_Study.json',import.meta.url),JSON.stringify(installed));
await fs.writeFile(new URL('../public/downloads/ATLAS_Sealed_Reports.json',import.meta.url),JSON.stringify(next.sealedStudy.reports.filter(r=>r.studyId===study.id)));
console.log(JSON.stringify({studyId:study.id,newStudy:!prior,records:installed.recordCount,assets:installed.assets.length,reports:next.sealedStudy.reports.length,integrity:verifyStudySeal(installed),externalTimestamp:'PENDING',originalUnchanged:true}));

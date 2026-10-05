import fs from 'node:fs/promises';
import {buildCycleResearch} from '../lib/cycle-research.mjs';
import {CYCLE_PROTOCOL} from '../lib/cycle-protocol.mjs';
import {sha256} from '../lib/cycle-math.mjs';
const root=new URL('../',import.meta.url),b=JSON.parse(await fs.readFile(new URL('public/data/atlas.json',root),'utf8'));
const report=buildCycleResearch(b.input,b.candidate,b.cycleResearch?.data,{runPairAnalysis:true});
const frozen={protocol:CYCLE_PROTOCOL,sha256:sha256(CYCLE_PROTOCOL)};
const path=new URL('reports/cycles/protocol-'+CYCLE_PROTOCOL.id+'.json',root);await fs.mkdir(new URL('.',path),{recursive:true});
try{const old=JSON.parse(await fs.readFile(path,'utf8'));if(old.sha256!==frozen.sha256)throw Error('기존 주기 검증 규칙을 덮어쓸 수 없습니다. 새 프로토콜 ID가 필요합니다.');}catch(e){if(e.code==='ENOENT')await fs.writeFile(path,JSON.stringify(frozen,null,2));else throw e;}
const result={id:report.id,at:report.generatedAt,protocol:frozen,counts:report.counts,audit:report.audit,models:report.rows.map(r=>({code:r.code,status:r.status,model:r.model??null,reasons:r.reasons})),accuracyCertified:false};
const name='audit-'+report.id+'.json',target=new URL('reports/cycles/'+name,root);
try{await fs.writeFile(target,JSON.stringify(result,null,2),{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;}
await fs.writeFile(new URL('public/downloads/cycle_audit.json',root),JSON.stringify(result,null,2));
console.log(JSON.stringify({status:report.audit.status,eligibleCandidates:report.counts.candidates,dateClusters:report.audit.dateClusters,independentProspectiveValidation:0,repeatedRunIsNotNewIndependentValidation:true}));

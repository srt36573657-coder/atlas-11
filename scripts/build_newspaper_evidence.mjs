import fs from 'node:fs/promises';
import path from 'node:path';
import {validateNewspaperEvidence} from '../lib/completion-newspaper.mjs';
const root=process.cwd(),at=new Date().toISOString(),input=JSON.parse(await fs.readFile('public/data/atlas.json','utf8')).input;
const names=['market','flows','company','fomo'],documents=[],missing=[];
for(const name of names){const file=`reports/completion/newspaper-${name}.json`;try{documents.push({...JSON.parse(await fs.readFile(file,'utf8')),file});}catch(e){if(e.code==='ENOENT'){missing.push(file);continue;}throw e;}}
const readSnapshot=async relative=>{const resolved=await fs.realpath(path.resolve(root,relative)),base=await fs.realpath(root);if(!resolved.startsWith(base+path.sep))throw Error('SNAPSHOT_OUTSIDE_PROJECT');return fs.readFile(resolved);};
const result=await validateNewspaperEvidence(documents,{codes:input.assets.map(a=>a.code),asOf:at,readSnapshot});result.missingResearchFiles=missing;result.period=[input.origin,input.end];result.forecastInputsModified=false;
await fs.mkdir('public/data',{recursive:true});await fs.mkdir('reports/completion',{recursive:true});await fs.writeFile('public/data/newspaper-evidence.json',JSON.stringify(result));
const report={schema:'atlas-newspaper-validation-1',checkedAt:at,filesRead:documents.map(d=>d.file),missingFiles:missing,summary:result.summary,sourceFailures:result.validation.rejected,conflicts:result.validation.conflicts,actualSnapshotHashChecks:result.summary.verifiedObservationSnapshots,notAccuracyValidation:true,forecastInputsModified:false,complete:missing.length===0&&result.validation.rejected.length===0};await fs.writeFile('reports/completion/newspaper-validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(missing.length||result.validation.rejected.length)process.exitCode=2;

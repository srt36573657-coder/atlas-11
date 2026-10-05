import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {calendarDates, dateRows} from '../lib/daily-explanation.mjs';
import {DAILY_VIEW} from '../lib/daily-view-contract.mjs';
const read=path=>fs.readFile(new URL('../'+path,import.meta.url),'utf8');
const json=async path=>JSON.parse(await read(path));
const hash=text=>createHash('sha256').update(text).digest('hex');
const jhash=obj=>hash(JSON.stringify(obj));
const [b,before,archived,tap,pkg]=await Promise.all([
  json('public/data/atlas.json'),json('reports/daily-before/data-hashes.json'),
  json('reports/daily-before/file-hashes.json'),read('reports/tests.tap'),json('package.json')]);
const count=name=>Number([...tap.matchAll(new RegExp('^# '+name+' (\\d+)$','gm'))].at(-1)?.[1]);
if(count('fail')!==0||count('cancelled')!==0||count('skipped')!==0||count('todo')!==0||count('pass')<134)throw Error('Completed passing full test suite required');
const versions=new Map([b.original,...b.priorVersions,b.candidate].map(v=>[v.id,v]));
for(const [id,value] of Object.entries(before.versions))if(jhash(versions.get(id))!==value)throw Error('Forecast changed: '+id);
if(versions.size!==Object.keys(before.versions).length)throw Error('Unexpected new forecast for a presentation change');
for(const [name,field] of [['input','input'],['evaluation','evaluation'],['logs','collectionLogs'],['actions','actions'],['updates','updates']])if(jhash(b[field])!==before[name])throw Error('Source history changed: '+field);
if(hash(await read('lib/news-engine.mjs'))!==before.engine)throw Error('Engine changed');
for(const [name,value] of Object.entries(archived))if(hash(await read('reports/daily-before/'+name.replaceAll('/','__')))!==value)throw Error('Archived source mismatch: '+name);
const dates=calendarDates(b.input.origin,b.input.end);
if(b.input.assets.length!==52||new Set(b.input.assets.map(a=>a.code)).size!==52||dates.length!==44)throw Error('Universe or calendar changed');
const coverage=b.candidate.assets.map(asset=>{
  const rows=dateRows({asset,version:b.candidate,input:b.input});
  return{code:asset.code,name:asset.name,dates:rows.length,byKind:rows.reduce((o,r)=>(o[r.kind]=(o[r.kind]??0)+1,o),{}),
    eventDays:rows.filter(r=>r.events.length).length,businessEvidenceDays:rows.filter(r=>r.events.some(e=>e.businessContext)).length,
    firstDate:rows[0].date,lastDate:rows.at(-1).date};
});
const sourceFiles=['src/atlas.tsx','src/globals.css','lib/story.mjs','lib/service.mjs','lib/daily-view-contract.mjs','lib/daily-explanation.mjs','tests/ui.test.mjs','tests/daily-explanation.test.mjs','tests/theme-contrast.test.mjs'];
const sourceHashes=Object.fromEntries(await Promise.all(sourceFiles.map(async path=>[path,hash(await read(path))])));
const report={appVersion:pkg.version,modelVersion:b.candidate.modelVersion,createdAt:new Date().toISOString(),sourceHashes,
  rules:DAILY_VIEW,tests:{total:count('tests'),passed:count('pass'),failed:0,skipped:count('skipped'),source:'reports/tests.tap',sha256:hash(tap)},
  explanationCount:coverage.reduce((s,a)=>s+a.dates,0),coverage,
  preservation:{passed:true,retainedForecasts:versions.size,sourceInputUnchanged:true,evaluationUnchanged:true,engineUnchanged:true,historyUnchanged:true},
  flatDiagnosis:'reports/daily-experience-flat-diagnosis.json',
  browserPreview:await json('reports/daily-experience/browser-preview.json'),
  trustProbability:null,predictiveAccuracyCertified:false,externalDeployment:false};
await fs.writeFile(new URL('../reports/daily-experience/validation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
await fs.writeFile(new URL('../public/downloads/daily_view_validation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({appVersion:report.appVersion,tests:report.tests,explanations:report.explanationCount,preservation:report.preservation}));

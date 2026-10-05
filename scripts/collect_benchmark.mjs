// Standalone reporting-only run. Normal refresh may install this result through
// the service's benchmarkCollector hook; this command never changes forecasts.
import fs from 'node:fs/promises';
import path from 'node:path';
import {collectBenchmark} from '../lib/benchmark-collection.mjs';
const args=process.argv.slice(2),arg=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1];};
const file=path.resolve(arg('--input','public/data/atlas.json'));
const output=path.resolve(arg('--output','reports/benchmark'));
const bundle=JSON.parse(await fs.readFile(file,'utf8')),input=bundle.input??bundle;
const previous=bundle.atlasBenchmark??{code:'KOSPI',prices:[],collectionLogs:[]};
const result=await collectBenchmark(previous,{sessions:input.calendar.sessions,origin:'2026-09-17',end:'2026-10-30',timeoutMs:Number(arg('--timeout-ms',8000))});
await fs.mkdir(output,{recursive:true});
const destination=path.join(output,'latest.json'),tmp=destination+'.tmp-'+process.pid;
await fs.writeFile(tmp,JSON.stringify(result,null,2)+'\n');await fs.rename(tmp,destination);
await fs.appendFile(path.join(output,'attempts.jsonl'),JSON.stringify(result.log)+'\n');
console.log(JSON.stringify(result.log));process.exitCode=result.exitCode;

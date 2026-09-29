/** Production Node adapter: collect raw company candidates without issuing an old-model forecast. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCompanyCollector } from '../lib/company-collection-runtime.mjs';

export async function collectCompletionCompany({input, directory='reports/completion/company-runtime', now=new Date(), fetcher, deadlineMs=20000}={}) {
  const collector=createCompanyCollector({directory,deadlineMs,timeoutMs:4000,concurrency:6,perHostConcurrency:1,maxAttempts:1,circuitFailures:2});
  const result=await collector({input,now,...(fetcher?{fetcher}:{})});
  const run={schema:'atlas-completion-company-runtime-1',observedAt:now.toISOString(),reusedObservation:Boolean(result.report.reusedObservation),report:result.report,exitCode:result.exitCode,newApprovedEvents:0,newApprovedFactorRecords:0,forecastIssued:false,inputMutated:false,note:'원문·제목·날짜 후보 수집이며 회사별 수치 또는 뉴스 영향 승인 아님. 과거 원장과 계산식은 수정하지 않는다.'};
  await fs.mkdir(path.join(directory,'runs'),{recursive:true});
  const file=path.join(directory,'runs',now.toISOString().replace(/[:.]/g,'-')+'.json');
  await fs.writeFile(file,JSON.stringify(run,null,2)+'\n',{flag:'wx'});
  await fs.writeFile(path.join(directory,'completion-latest.json'),JSON.stringify(run,null,2)+'\n');
  return run;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const argument=name=>{const n=process.argv.indexOf(name);return n<0?null:process.argv[n+1];};
  const source=JSON.parse(await fs.readFile(argument('--input')||'public/data/input.json','utf8'));
  const run=await collectCompletionCompany({input:source.input??source,directory:argument('--output')||'reports/completion/company-runtime',deadlineMs:Number(argument('--deadline-ms')||20000)});
  console.log(JSON.stringify({exitCode:run.exitCode,reusedObservation:run.reusedObservation,successfulSources:run.report.successfulSources,failedSources:run.report.failedSources,deferredSources:run.report.deferredSources,newApprovedEvents:0,newApprovedFactorRecords:0,forecastIssued:false}));
  process.exitCode=run.exitCode;
}

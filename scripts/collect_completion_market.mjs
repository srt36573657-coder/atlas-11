import fs from 'node:fs/promises';
import path from 'node:path';
import {collectSources52} from '../lib/news-collection52.mjs';
import {MARKET_SERIES,marketHash,fredURL,splitWebExtract,parseFredBody,mergeCapturedSeries,parseFedPolicy} from '../lib/completion-market.mjs';
const root=process.cwd(),base=path.join(root,'reports/completion'),raw=path.join(base,'raw-market');await fs.mkdir(raw,{recursive:true});
const input=JSON.parse(await fs.readFile('public/data/atlas.json')).input,codes=input.assets.map(a=>a.code).sort(),now=new Date().toISOString();
if(codes.length!==52||new Set(codes).size!==52)throw new Error('EXACT_52_REQUIRED');
let runtime=null;
if(!process.argv.includes('--normalize-only')){
  const sources=MARKET_SERIES.filter(s=>['DFII10','DEXKOUS','WALCL','IRLTLT01KRM156N','CPIAUCSL'].includes(s.id)).map(s=>({id:'source:'+marketHash(fredURL(s.id)).slice(0,24),url:fredURL(s.id),host:'fred.stlouisfed.org',codes,references:[],config:{enabled:true},series:s.id}));
  const registry={codes,sources,assets:input.assets.map(a=>({code:a.code,sourceIds:sources.map(s=>s.id)}))};
  const run=await collectSources52(registry,{deadlineMs:12000,timeoutMs:3500,maxAttempts:1,perHostConcurrency:1,circuitThreshold:2,onSnapshot:async s=>{const payload={observedAt:s.metadata.observedAt,series:s.source.series,url:s.source.url,rawHash:s.metadata.contentSha256,representation:'http_csv',body:Buffer.from(s.body).toString('utf8')};await fs.writeFile(path.join(raw,'http-'+s.metadata.contentSha256+'.json'),JSON.stringify(payload));}});
  runtime={at:now,report:run.report};await fs.writeFile(path.join(raw,'runtime-'+now.replace(/[:.]/g,'-')+'.json'),JSON.stringify(runtime,null,2));
}
const found=new Map(MARKET_SERIES.map(s=>[s.id,[]])),parseErrors=[],fedPolicies=[];
for(const name of (await fs.readdir(raw)).filter(x=>x.endsWith('.json')).sort()){
  const captured=JSON.parse(await fs.readFile(path.join(raw,name),'utf8'));
  if(captured.representation==='http_csv'){
    try{found.get(captured.series)?.push(parseFredBody(captured.body,captured.series,{observedAt:captured.observedAt,representation:'http_csv'}));}catch(e){parseErrors.push({file:name,error:e.message});}continue;
  }
  for(const body of splitWebExtract(captured.response)){
    const series=body.match(/https:\/\/fred\.stlouisfed\.org\/data\/([A-Z0-9]+)/)?.[1];
    if(found.has(series))try{found.get(series).push(parseFredBody(body,series,{observedAt:captured.observedAt}));}catch(e){parseErrors.push({file:name,error:e.message});}
    if(body.startsWith('Federal Reserve Board - Open Market Operations'))try{fedPolicies.push(parseFedPolicy(body,{observedAt:captured.observedAt}));}catch(e){parseErrors.push({file:name,error:e.message});}
  }
}
const series=MARKET_SERIES.map(s=>mergeCapturedSeries(found.get(s.id),s));
for(const s of series)await fs.writeFile(path.join(base,'market-'+s.id+'.json'),JSON.stringify(s,null,2));
const policy=fedPolicies.find(x=>x.count>0)||null;if(policy)await fs.writeFile(path.join(base,'market-fed-policy.json'),JSON.stringify(policy,null,2));
const factorRows=[];
for(let n=1;n<=13;n++){
  const id='F'+String(n).padStart(2,'0'),arr=series.filter(s=>s.factorId===id&&s.sourceVerified),has=arr.length>0,policyPart=id==='F02'?policy:null;
  factorRows.push({factorId:id,targetCodes:codes,sourceVerified:has||!!policyPart,componentOnly:arr.length?arr.every(s=>s.componentOnly):true,count:arr.reduce((a,s)=>a+s.count,0)+(policyPart?.count||0),historyStart:[...arr.map(s=>s.historyStart),...(policyPart?[policyPart.rows[0]?.date]:[])].filter(Boolean).sort()[0]||null,historyEnd:[...arr.map(s=>s.historyEnd),...(policyPart?[policyPart.rows.at(-1)?.date]:[])].filter(Boolean).sort().at(-1)||null,sources:[...arr.flatMap(s=>s.sources),...(policyPart?[{url:policyPart.sourceUrl,rawHash:policyPart.rawHash,observedAt:policyPart.observedAt,representation:'web_text_extract'}]:[])],series:arr.map(s=>s.id),collectorStatus:has||policyPart?'partial':'blocked',historyComplete:false,modelConnected:false,importReady:false,approvedRecordCount:0,blockers:has?arr.flatMap(s=>s.blockers):policyPart?policyPart.blockers:id==='F08'?['KOFIA 원자료는 flows-summary에서 별도 관리']:id==='F11'?['공식 시장 전체 구성/시장폭 미확보: ATLAS52 대용값과 구분']:id==='F01'?['한국은행 기준금리 공식 원문 재접속 실패','IMF 재할인율·콜금리를 기준금리로 대체하지 않음']:['정의에 맞는 공식 원자료 미확보']});
}
const report={schema:'atlas-completion-market-1',generatedAt:now,sourceVintage:'current_retrieval_not_point_in_time',targetCodes:codes,sourceBodyHashMeaning:'sha256 of saved web text extract or HTTP entity as explicitly marked; not a claim of original historical bytes',perFactor:factorRows,factors:factorRows,series:series.map(({rows,...rest})=>rest),rawNumericSeries:series.filter(s=>s.count>0).length,totalNumericRows:series.reduce((n,s)=>n+s.count,0),sourceFactorCount:factorRows.filter(s=>s.sourceVerified).length,completeFactorCount:0,approvedForModel:0,policy,parseErrors,runtime,exitCode:2};
await fs.writeFile(path.join(base,'market-summary.json'),JSON.stringify(report,null,2));
await fs.writeFile(path.join(base,'market-summary.md'),`# 거시·시장 실제 수집\n\n${series.filter(s=>s.count>0).length}개 수치시계열 ${report.totalNumericRows}행을 공식 제공기관 본문에서 확보했다. FRED는 원 제공기관을 명시한 공개 데이터 제공 경로다. 원문 추출 해시와 관측 시각을 보존했다. 과거 당시 빈티지·공개시각·기업 노출·추가 예측력은 별도 검토 대상이므로 승인 입력은 0건이다.\n\n`+factorRows.map(x=>`- ${x.factorId}: ${x.sourceVerified?'원자료 일부 확보':'미확보'} / ${x.count}행 / ${x.historyStart||'없음'}~${x.historyEnd||'없음'} / ${[...new Set(x.blockers)].join('; ')}`).join('\n')+'\n');
console.log(JSON.stringify({rawNumericSeries:report.rawNumericSeries,totalNumericRows:report.totalNumericRows,sourceFactorCount:report.sourceFactorCount,approvedForModel:0,parseErrors:parseErrors.length,summary:'reports/completion/market-summary.json'}));process.exitCode=2;

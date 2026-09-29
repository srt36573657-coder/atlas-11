import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {forecast,empiricalCRPS,MODEL_VERSION} from '../lib/news-engine.mjs';
import {training} from '../lib/engine.mjs';
import {average,nonOverlappingOrigins,blockInterval,intervalScore,logLoss} from '../lib/audit.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFile(new URL(p,root),'utf8'),write=(p,v)=>fs.writeFile(new URL(p,root),typeof v==='string'?v:JSON.stringify(v,null,2));
const protocolText=await read('reports/audit_protocol.json'),protocol=JSON.parse(protocolText),input=JSON.parse(await read('public/data/input.json'));
if(protocol.engine!==MODEL_VERSION)throw Error('현재 엔진과 고정 검증 규칙이 다릅니다.');
delete input.calibration;
const hash=s=>createHash('sha256').update(s).digest('hex'),engineHash=hash(await read('lib/news-engine.mjs'));
const modelFiles=['lib/news-engine.mjs','lib/engine.mjs','lib/news-scope.mjs','lib/evidence.mjs','lib/probability.mjs'];
const sourceHashes=Object.fromEntries(await Promise.all(modelFiles.map(async p=>[p,hash(await read(p))])));
const sessions=input.calendar.sessions.filter(d=>d<=protocol.lastTarget),possible=sessions.filter((d,i)=>d>=protocol.firstOrigin&&i+protocol.horizons<sessions.length),
  origins=possible.filter((d,i)=>i%protocol.strideSessions===0&&input.assets.every(a=>{const t=training(a,d,sessions);return t.anchor&&t.returns.length>=protocol.minimumTrainingReturnsPerStock;}));
const records=[],folds=[],skipped=[];
for(let k=0;k<origins.length;k++){
  const origin=origins[k],end=sessions[sessions.indexOf(origin)+protocol.horizons],cutoff=origin+'T16:00:00+09:00';
  // Fitting receives no outcome prices after the origin. Scoring uses separate maps.
  const foldInput={...input,origin,end,actualAsOf:origin,assets:input.assets.map(a=>({...a,prices:a.prices.filter(p=>p.date<=origin)}))};
  const truths=new Map(input.assets.map(a=>[a.code,new Map(a.prices.filter(p=>p.quality!=='conflict').map(p=>[p.date,p.close]))]));
  const past=new Map(input.assets.map(a=>[a.code,training(a,origin,sessions)])),distributionScores=new Map();
  const v=forecast(foldInput,{origin,paths:protocol.paths,seed:protocol.seed,informationCutoff:cutoff,createdAt:cutoff,
    onDistribution({code,date,originPrice,sorted,baselineSorted}){
      const actual=truths.get(code).get(date);if(!(actual>0))return;
      distributionScores.set(code+':'+date,{crps:empiricalCRPS(sorted,actual)/originPrice,noNewsCRPS:empiricalCRPS(baselineSorted,actual)/originPrice});
    }});
  for(const a of v.assets){
    const t=past.get(a.code),returns=t.returns.slice(-252),drift=average(returns.map(r=>r.value));
    for(const r of a.rows.slice(1)){
      const h=v.targets.indexOf(r.date),actual=truths.get(a.code).get(r.date);
      if(!(actual>0)){skipped.push({origin,code:a.code,target:r.date,reason:'유효 실제 종가 없음'});continue;}
      const historical=[];
      for(let j=Math.max(h,sessions.indexOf(origin)-252);j<=sessions.indexOf(origin);j++){
        const p=t.prices.get(sessions[j]),q=t.prices.get(sessions[j-h]);if(p&&q)historical.push(p.close>q.close?1:0);
      }
      const y=actual>a.originPrice?1:0,empiricalProb=average(historical)??.5,driftPrice=a.originPrice*Math.exp(h*drift),p=r.rawProbUp;
      records.push({origin,target:r.date,horizon:h,code:a.code,events:a.eventsUsed,
        modelError:Math.abs(r.p50-actual)/a.originPrice,flatError:Math.abs(a.originPrice-actual)/a.originPrice,
        driftError:Math.abs(driftPrice-actual)/a.originPrice,noNewsError:Math.abs(r.noNewsP50-actual)/a.originPrice,
        relativeActualError:Math.abs(r.p50/actual-1),flatRelativeActualError:Math.abs(a.originPrice/actual-1),
        prob:p,actualUp:y,brier:(p-y)**2,noNewsBrier:(r.noNewsProbUp-y)**2,empiricalBrier:(empiricalProb-y)**2,
        logLoss:logLoss(p,y),empiricalLogLoss:logLoss(empiricalProb,y),
        covered:Number(actual>=r.p10&&actual<=r.p90),noNewsCovered:Number(actual>=r.noNewsP10&&actual<=r.noNewsP90),
        intervalScore:intervalScore(r.p10,r.p90,actual)/a.originPrice,noNewsIntervalScore:intervalScore(r.noNewsP10,r.noNewsP90,actual)/a.originPrice,
        ...distributionScores.get(a.code+':'+r.date)});
    }
  }
  folds.push({origin,end,rows:records.filter(r=>r.origin===origin).length,acceptedEvents:v.eventGate.accepted.length,retainedExtremeAssetDays:v.assets.reduce((s,a)=>s+a.training.retainedExtremeDays.length,0)});
  if(k%10===0)console.log(JSON.stringify({fold:k+1,total:origins.length,origin}));
}
const summarize=rows=>Object.fromEntries(['modelError','flatError','driftError','noNewsError','relativeActualError','flatRelativeActualError','brier','noNewsBrier','empiricalBrier','logLoss','empiricalLogLoss','covered','noNewsCovered','crps','noNewsCRPS','intervalScore','noNewsIntervalScore'].map(k=>[k,average(rows.map(r=>r[k]))]));
const nonoverlap=nonOverlappingOrigins(folds),primaryRows=records.filter(r=>r.horizon===protocol.primaryHorizon&&nonoverlap.includes(r.origin));
const deltas=nonoverlap.map(origin=>{const r=primaryRows.filter(r=>r.origin===origin);return {origin,price:average(r.map(r=>r.modelError-r.flatError)),brier:average(r.map(r=>r.brier-.25))};});
const ci=key=>blockInterval(deltas.map(d=>d[key]),{replications:protocol.bootstrapReplications,seed:protocol.bootstrapSeed,blockLength:2});
const priceDifference=ci('price'),brierDifference=ci('brier');
const report={schema:1,createdAt:new Date().toISOString(),method:MODEL_VERSION,engineSHA256:engineHash,protocolSHA256:hash(protocolText),inputSHA256:hash(JSON.stringify(input)),
  purpose:protocol.purpose,protocol,folds,counts:{origins:origins.length,forecastRows:records.length,nonoverlapOrigins:nonoverlap.length,primaryRows:primaryRows.length,
    monteCarloPathsPerFit:protocol.paths,bootstrapReplicationsPerMetric:protocol.bootstrapReplications,bootstrapMetrics:2,skipped:skipped.length},
  sourceHashes,overall:summarize(records),withUsableNews:{n:records.filter(r=>r.events>0).length,metrics:summarize(records.filter(r=>r.events>0))},withoutUsableNews:{n:records.filter(r=>!r.events).length,metrics:summarize(records.filter(r=>!r.events))},primary:{horizon:protocol.primaryHorizon,origins:nonoverlap,metrics:summarize(primaryRows),priceDifference,brierDifference,
    beatsFlatPriceOnInterval:priceDifference.high<0,beats50PercentOnInterval:brierDifference.high<0},
  horizons:Array.from({length:protocol.horizons},(_,i)=>({horizon:i+1,...summarize(records.filter(r=>r.horizon===i+1))})),
  assets:input.assets.map(a=>({code:a.code,name:a.name,...summarize(records.filter(r=>r.code===a.code)),primary:summarize(primaryRows.filter(r=>r.code===a.code))})),
  status:'research_only',trustProbability:null,
  limitations:['회사·업종 고유 예정 뉴스와 발표 예상/결과 수치는 미확보','이미 사용한 과거 자료의 재진단이며 새 독립 검증이 아님','원 자료의 당시 빈티지·기업행위 조정 미확인','같은 날 52종목은 한 날짜 집단으로 취급','겹치지 않는 평가 구간도 시계열 독립을 보장하지 않음','표본을 재추출한 횟수는 독립 교차검증 횟수가 아님','통계 구간이 음수여도 인과 효과·미래 투자 수익 보장은 아님'],skipped};
if(hash(await read('lib/news-engine.mjs'))!==engineHash)throw Error('검증 중 엔진 변경 · 결과 폐기');
for(const p of modelFiles)if(hash(await read(p))!==sourceHashes[p])throw Error('검증 중 의존 모듈 변경 · 결과 폐기');
await write('reports/model_audit.json',report);await write('public/downloads/model_audit.json',report);
const columns=Object.keys(records[0]);await write('reports/model_folds.csv',columns.join(',')+'\n'+records.map(r=>columns.map(c=>r[c]).join(',')).join('\n')+'\n');
console.log(JSON.stringify({counts:report.counts,primary:report.primary,overall:report.overall},null,2));

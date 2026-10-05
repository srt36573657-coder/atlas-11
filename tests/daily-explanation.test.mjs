import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {calendarDates,dateRows,buildDailyExplanation} from '../lib/daily-explanation.mjs';
const bundle=JSON.parse(await fs.readFile(new URL('../public/data/atlas.json',import.meta.url),'utf8'));
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function fixture(){
 const codes=Array.from({length:52},(_,i)=>String(i+1).padStart(6,'0'));
 const input={origin:'2026-09-17',end:'2026-10-30',actualAsOf:'2026-09-17',calendar:{sessions:['2026-09-16','2026-09-17','2026-09-18','2026-09-21','2026-09-22','2026-09-23']},
  assets:codes.map((code,i)=>({code,name:'기업'+(i+1),sector:'업종'+(i%3),prices:[{date:'2026-09-16',close:100},{date:'2026-09-17',close:102}],priceSource:{provider:'NAVER',url:'https://finance.naver.com/item/sise.naver?code='+code,quality:'single_source'}}))};
 const event={id:'market',kind:'CPI',name:'확인된 경제 발표',targetDate:'2026-09-18',scope:{type:'market'},sources:[{name:'원문',url:'https://www.bls.gov/schedule/'}]};
 const company={id:'only-a',kind:'COMPANY_IR',name:'기업1 설명회',targetDate:'2026-09-18',scope:{type:'company',codes:[codes[0]]},sources:[{name:'기업1 원문',url:'https://company-one.co.kr/ir'}]};
 const version={origin:input.origin,end:input.end,eventGate:{accepted:[event,company]},assets:input.assets.map((a,i)=>({...a,
  rows:[{date:'2026-09-17',anchor:true,p10:102,p50:102,p90:102,mean:102},{date:'2026-09-18',p10:95,p50:110,p90:125,mean:112,eventIds:['market']},{date:'2026-09-21',p10:90,p50:108,p90:130,mean:113,eventIds:[]}],
  numericSummary:{rows:[{date:'2026-09-18',meanMethod:'analytic_conditional_empirical_moments',increment:{count:2,logReturnMean:0,logReturnVariance:0.0004}}]},
  news:[{...event,date:event.targetDate,used:true,reason:'이 종목의 과거 표본 사용',sampleCount:2,samples:[{code:a.code,date:'2026-08-01',value:i===0?0.01:-0.03,source:event.sources[0].url},{code:a.code,date:'2026-08-10',value:i===0?0.03:-0.01,source:event.sources[0].url}],selection:{rawMean:i===0?0.02:-0.02,lambda:0,mu:0,folds:0,candidates:[{lambda:0,kept:true,reason:'표본 부족'}]},effect:0},
   ...(i===0?[{...company,date:company.targetDate,used:false,reason:'표본 부족',sampleCount:0,samples:[],selection:{rawMean:0,lambda:0,mu:0,folds:0},effect:null}]:[])]}))};
 return{input,version,asset:version.assets[0]};
}
test('calendar covers all 44 fixed dates in order and rejects invalid dates',()=>{
 const dates=calendarDates('2026-09-17','2026-10-30');assert.equal(dates.length,44);assert.equal(new Set(dates).size,44);assert.equal(dates.at(-1),'2026-10-30');
 assert.deepEqual(calendarDates('2028-02-28','2028-03-01'),['2028-02-28','2028-02-29','2028-03-01']);
 assert.throws(()=>calendarDates('2026-02-30','2026-03-01'));assert.throws(()=>calendarDates('2026-10-30','2026-09-17'));
});
test('all original 52 × 44 dates are explained without changing prices, source events or forecasts',()=>{
 const before=digest(bundle),sessions=new Set(bundle.input.calendar.sessions);let count=0;
 for(const asset of bundle.candidate.assets){
  const rows=dateRows({asset,version:bundle.candidate,input:bundle.input});assert.equal(rows.length,44);
  for(const row of rows){count++;assert.equal(row.code,asset.code);assert.equal(row.trustProbability,null);assert.ok(row.summary.includes(asset.name));
   assert.equal(row.kind==='holiday',!sessions.has(row.date));
   if(row.kind==='holiday'){assert.equal(row.actual,null);assert.equal(row.forecast,null);assert.deepEqual(row.events,[]);}
   for(const event of row.events){assert.equal(event.date,row.date);if(event.scope.type==='company')assert.ok(event.scope.codes.includes(asset.code));}
  }
 }
 assert.equal(count,2288);assert.equal(digest(bundle),before);
});
test('actual closes win display while frozen forecast is retained and changes match exact stored numbers',()=>{
 const data=fixture(),actual=buildDailyExplanation({...data,date:'2026-09-17'});
 assert.equal(actual.kind,'actual');assert.equal(actual.value,102);assert.equal(actual.actual.change.amount,2);assert.equal(actual.actual.change.rate,0.020000000000000018);
 const future=buildDailyExplanation({...data,date:'2026-09-18'});
 assert.equal(future.kind,'forecast');assert.equal(future.forecast.p50Change.amount,8);assert.equal(future.forecast.p50Change.rate,110/102-1);
 assert.equal(future.forecast.meanChange.amount,10);assert.equal(future.forecast.meanChange.rate,112/102-1);
 assert.equal(future.forecast.p10,95);assert.equal(future.forecast.p90,125);assert.equal(future.forecast.mean,112);assert.match(future.text,/개별 뉴스의 기여율로 나누지/);
 data.input.assets[0].prices.push({date:'2026-09-18',close:107});data.input.actualAsOf='2026-09-18';
 const observed=buildDailyExplanation({...data,date:'2026-09-18'});assert.equal(observed.kind,'actual');assert.equal(observed.value,107);assert.equal(observed.forecast.p50,110);
});
test('holiday references prior session without minting an actual price or repeating prior news',()=>{
 const data=fixture(),row=buildDailyExplanation({...data,date:'2026-09-19'});
 assert.equal(row.kind,'holiday');assert.equal(row.value,110);assert.equal(row.valueDate,'2026-09-18');assert.equal(row.carried,true);
 assert.equal(row.reference.kind,'forecast');assert.equal(row.actual,null);assert.equal(row.forecast,null);assert.deepEqual(row.events,[]);
 assert.match(row.text,/새 종가를 만들지/);
});
test('company news cannot leak and common news explains each own stock sample and coefficients',()=>{
 const data=fixture(),a=buildDailyExplanation({...data,date:'2026-09-18'}),b=buildDailyExplanation({...data,asset:data.version.assets[1],date:'2026-09-18'});
 assert.equal(a.events.length,2);assert.equal(b.events.length,1);assert.equal(b.events[0].id,'market');
 assert.equal(a.events[0].rawMeanLogPercent,2);assert.equal(b.events[0].rawMeanLogPercent,-2);
 assert.match(a.events[0].paragraphs.join(' '),/기업1 자체/);assert.match(b.events[0].paragraphs.join(' '),/기업2 자체/);
 assert.equal(a.events[0].selection.lambda,0);assert.equal(a.events[0].effect,0);assert.match(a.text,/중심 효과 0/);
 // Even a corrupted caller's profile array cannot route another company's event.
 data.version.assets[1].news.push(structuredClone(data.asset.news[1]));
 const safe=buildDailyExplanation({...data,asset:data.version.assets[1],date:'2026-09-18'});assert.equal(safe.events.length,1);
 data.asset.news[0].samples[0].code=data.version.assets[1].code;
 const mismatch=buildDailyExplanation({...data,date:'2026-09-18'}).events[0];assert.equal(mismatch.numericEvidenceUsable,false);assert.equal(mismatch.rawMeanLog,null);assert.equal(mismatch.selection,null);
});
test('projection preserves source links and summary numbers without inventing code contamination or business causation',()=>{
 const data=fixture(),full=buildDailyExplanation({...data,date:'2026-09-18'});
 const projected=structuredClone(data);for(const p of projected.asset.news)for(const sample of p.samples)delete sample.code;
 const view=buildDailyExplanation({...projected,date:'2026-09-18'});
 assert.deepEqual(view.events[0].sources,full.events[0].sources);assert.equal(view.events[0].rawMeanLog,full.events[0].rawMeanLog);
 assert.equal(view.events[0].sampleOwnership,'ASSET_PROFILE_CODE_METADATA_OMITTED');assert.equal(view.events[0].numericEvidenceUsable,true);assert.equal(view.events[0].businessContext,null);
 projected.asset.news[0].transmission='확인된 입력의 경로 설명';
 assert.equal(buildDailyExplanation({...projected,date:'2026-09-18'}).events[0].businessContext.text,'확인된 입력의 경로 설명');
});
test('zero samples, missing quotes, missing forecast and unknown business narrative remain explicit',()=>{
 const data=fixture(),zero=buildDailyExplanation({...data,date:'2026-09-18'}).events.find(e=>e.id==='only-a');
 assert.equal(zero.sampleCount,0);assert.equal(zero.rawMeanLog,null);assert.equal(zero.effect,null);assert.equal(zero.used,false);
 data.input.assets[0].prices.find(p=>p.date==='2026-09-17').quality='conflict';
 const missingAnchor=buildDailyExplanation({...data,date:'2026-09-17'});assert.equal(missingAnchor.kind,'missing');assert.equal(missingAnchor.value,null);
 const missing=buildDailyExplanation({...data,date:'2026-09-22'});assert.equal(missing.kind,'missing');assert.equal(missing.value,null);assert.match(missing.text,/채우지 않습니다/);
 const noEvent=buildDailyExplanation({...data,date:'2026-09-21'});assert.equal(noEvent.events.length,0);assert.match(noEvent.text,/확정 예측이 아니며/);
});
test('distribution comparison uses one previous mean and consistent ordinary gross moments, never a causal news share',()=>{
 const data=fixture();
 data.asset.rows[1].mean=102*1.02;data.asset.rows[2].mean=data.asset.rows[1].mean*1.01;
 data.asset.numericSummary.rows[0].increment.logGrossMean=Math.log(1.02);
 data.asset.numericSummary.rows.push({date:'2026-09-21',increment:{count:200,logGrossMean:Math.log(1.01),logReturnMean:0,logReturnVariance:0.001}});
 data.asset.training={start:'2025-09-01',end:'2026-09-17',returns:200,sigma:0.031};
 const explanation=buildDailyExplanation({...data,date:'2026-09-18'}),comparison=explanation.forecast.modelDistributionComparison;
 assert.equal(comparison.ordinaryReferenceDate,'2026-09-21');assert.equal(comparison.eventGrossFactor,1.02);assert.equal(comparison.ordinaryGrossFactor,1.01);
 assert.ok(Math.abs(comparison.meanDifference-1.02)<1e-12);assert.equal(comparison.previousMean,102);assert.equal(comparison.causal,false);
 assert.match(explanation.text,/인과효과가 아닙니다/);assert.ok(explanation.sources.some(s=>s.url.includes('code=000001')));
 const ordinary=buildDailyExplanation({...data,date:'2026-09-21'});assert.equal(ordinary.forecast.modelDistributionComparison.meanDifference,0);
 assert.match(ordinary.text,/추세 평균을 제거한 표본/);assert.match(ordinary.text,/200개/);assert.match(ordinary.text,/2025-09-01/);
 data.asset.rows.push({date:'2026-09-22',p50:110,p10:80,p90:140,mean:120,eventIds:[]});
 data.asset.numericSummary.rows.push({date:'2026-09-22',increment:{logGrossMean:Math.log(1.03)}});
 assert.equal(buildDailyExplanation({...data,date:'2026-09-18'}).forecast.modelDistributionComparison,null);
 data.asset.rows.pop();data.asset.numericSummary.rows.pop();data.asset.rows[1].mean=999;
 assert.equal(buildDailyExplanation({...data,date:'2026-09-18'}).forecast.modelDistributionComparison,null);
});

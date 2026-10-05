import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {calculateFomo,FOMO_FEATURES,midRank} from '../lib/fomo.mjs';
import {mergeFomoInput} from '../lib/fomo-input.mjs';
import {evaluateFomoCandidate} from '../lib/fomo-validation.mjs';
import {pricesAsOf} from '../lib/evidence.mjs';
import {parseNaver} from '../lib/market-data.mjs';
import {collectActual} from '../lib/service.mjs';
import {forecastSummary,chartDomain,eventState} from '../lib/graph-explanation.mjs';
function fixture(){
 const sessions=[];for(let n=0;sessions.length<430;n++){const d=new Date(Date.UTC(2024,0,1+n));if(d.getUTCDay()%6!==0)sessions.push(d.toISOString().slice(0,10));}
 const code='005930';let close=100;
 const prices=sessions.map((date,i)=>{const prior=close;close*=Math.exp(.001+.012*Math.sin(i*.53)+.004*Math.cos(i*.11));return{date,close,open:prior*1.001,high:Math.max(close,prior*1.001)*1.02,low:Math.min(close,prior*1.001)*.98,volume:1000+i*5+100*Math.sin(i),featureObservedAt:date+'T16:00:00+09:00',
  fomo:{code,date,sourceUrl:'https://example.org/observations',observedAt:date+'T16:00:00+09:00',methodId:'same-query-and-dedup-v1',turnover:1000000+i*100,retailNetBuy:5000*Math.sin(i),retailBuy:300000,retailSell:250000,marginBalance:1000+i,uniqueCompanyEvents:1+(i%7),searchIndex:30+(i%50),uniqueAuthors:100+(i%30)}};});
 return{origin:sessions[400],end:sessions.at(-1),actualAsOf:sessions.at(-1),informationAsOf:sessions.at(-1)+'T20:00:00+09:00',calendar:{sessions},assets:[{code,name:'시험 기업',prices}]};
}
test('18 features form six equal groups; complete observed fixture yields bounded deterministic scores',()=>{
 const input=fixture(),before=JSON.stringify(input),f=calculateFomo({input,code:'005930',date:input.actualAsOf});
 assert.equal(FOMO_FEATURES.length,18);assert.equal(new Set(FOMO_FEATURES.map(f=>f.id)).size,18);assert.equal(f.available,18);assert.equal(f.groups.length,6);assert.ok(f.score>=0&&f.score<=100);assert.equal(f.priceWeight,0);assert.equal(f.trustProbability,null);assert.equal(f.forecastIntegration.enabled,false);assert.deepEqual(f,calculateFomo({input,code:'005930',date:input.actualAsOf}));assert.equal(JSON.stringify(input),before);
 for(const g of f.groups)assert.equal(g.available,3);
 for(const x of f.features){assert.ok(x.weight>0&&x.weight<=1);assert.ok(x.referenceCount>=60);}
 assert.equal(f.windowDates.length,10);assert.ok(f.referenceEnd<f.windowDates[0]);
});
test('close-only observations expose six-feature price heat, never a completed FOMO score',()=>{
 const input=fixture();input.assets[0].prices=input.assets[0].prices.map(({date,close})=>({date,close}));const f=calculateFomo({input,code:'005930',date:input.actualAsOf});
 assert.equal(f.available,6);assert.equal(f.score,null);assert.ok(Number.isFinite(f.priceHeat));assert.equal(f.features.filter(x=>x.score===null).length,12);assert.equal(f.forecastIntegration.enabled,false);
});
test('flat ties are neutral; empirical rank endpoints and ties match direct counting',()=>{
 assert.equal(midRank(2,[1,2,2,3]),50);assert.equal(midRank(0,[1,2]),0);assert.equal(midRank(3,[1,2]),100);
 const input=fixture();for(const p of input.assets[0].prices){p.close=100;p.open=100;p.high=100;p.low=100;}const f=calculateFomo({input,code:'005930',date:input.actualAsOf});assert.equal(f.priceHeat,50);assert.equal(f.features.find(x=>x.id==='closeLocation').value,.5);
});
test('missing latest session cannot be filled with an older day; reference gaps reduce usable windows',()=>{
 const input=fixture();input.assets[0].prices.pop();const f=calculateFomo({input,code:'005930',date:input.actualAsOf});assert.equal(f.available,0);assert.equal(f.priceHeat,null);assert.equal(f.score,null);
});
test('future observations and other-company inputs cannot affect selected-date score',()=>{
 const input=fixture(),date=input.calendar.sessions[350],before=calculateFomo({input,code:'005930',date});
 for(const row of input.assets[0].prices.filter(p=>p.date>date)){row.close*=100;row.volume*=999;row.fomo.searchIndex=99999;}
 input.assets.push({code:'000660',name:'다른 회사',prices:input.assets[0].prices.map(p=>({...p,close:99999}))});
 assert.deepEqual(calculateFomo({input,code:'005930',date}),before);
});
test('supplement timestamps, company identity and reference-series method are mandatory',()=>{
 const input=fixture();for(const p of input.assets[0].prices){p.fomo.observedAt='2099-01-01T00:00:00Z';p.featureObservedAt='2099-01-01T00:00:00Z';}const future=calculateFomo({input,code:'005930',date:input.actualAsOf});assert.equal(future.available,6);
 const other=fixture();for(const p of other.assets[0].prices)p.fomo.code='000660';assert.equal(calculateFomo({input:other,code:'005930',date:other.actualAsOf}).available,12);
 const methods=fixture();methods.assets[0].prices.at(-1).fomo.methodId='incompatible';const f=calculateFomo({input:methods,code:'005930',date:methods.actualAsOf});assert.ok(f.features.filter(x=>x.group==='관심 확산').every(x=>x.score===null));
});
test('raw ten-session return and acceleration match independent price ratios',()=>{
 const input=fixture(),ps=input.assets[0].prices,f=calculateFomo({input,code:'005930',date:input.actualAsOf});const value=id=>f.features.find(x=>x.id===id).value;
 assert.ok(Math.abs(value('return10')-Math.log(ps.at(-1).close/ps.at(-11).close))<1e-12);
 assert.ok(Math.abs(value('acceleration')-(Math.log(ps.at(-1).close/ps.at(-6).close)-Math.log(ps.at(-6).close/ps.at(-11).close)))<1e-12);
 const scaled=structuredClone(input);for(const p of scaled.assets[0].prices)for(const k of ['close','open','high','low'])p[k]*=100;
 const other=calculateFomo({input:scaled,code:'005930',date:input.actualAsOf});assert.ok(Math.abs(other.priceHeat-f.priceHeat)<1e-9);
});
test('feature import is atomic, scoped, conflict-aware and reversible by recorded timestamp',()=>{
 const input=fixture(),date=input.actualAsOf;for(const p of input.assets[0].prices)delete p.fomo;
 const now=date+'T22:00:00+09:00',payload={schema:'atlas-fomo-input-1',rows:[{code:'005930',date,sourceUrl:'https://example.org/feed',observedAt:date+'T16:00:00+09:00',retailNetBuy:300,turnover:10000}]};
 const before=JSON.stringify(input),next=mergeFomoInput(input,payload,{now,targetCode:'005930'});assert.equal(JSON.stringify(input),before);assert.equal(next.priceRevisions.length,1);assert.deepEqual(pricesAsOf(next,date+'T20:00:00+09:00'),input.assets);assert.equal(next.assets[0].prices.at(-1).close,input.assets[0].prices.at(-1).close);
 assert.throws(()=>mergeFomoInput(input,payload,{now,targetCode:'000660'}));const changed=structuredClone(payload);changed.rows[0].retailNetBuy=400;assert.throws(()=>mergeFomoInput(next,changed,{now}));
 const bad=structuredClone(payload);bad.rows.push({...bad.rows[0],code:'000660'});assert.throws(()=>mergeFomoInput(input,bad,{now}));assert.equal(JSON.stringify(input),before);
});
test('late optional inputs can be viewed now without changing historical-date scores',()=>{
 const input=fixture();for(const p of input.assets[0].prices)delete p.fomo;
 const date=input.actualAsOf;input.informationAsOf=date+'T23:59:59+09:00';const now=new Date(Date.parse(date+'T00:00:00Z')+3*86400000).toISOString();
 const before=calculateFomo({input,code:'005930',date});const next=mergeFomoInput(input,{schema:'atlas-fomo-input-1',rows:[{code:'005930',date,observedAt:now,sourceUrl:'https://example.org/data',turnover:100,retailNetBuy:10}]},{now});
 assert.deepEqual(calculateFomo({input:next,code:'005930',date}),before);assert.equal(calculateFomo({input:next,code:'005930',date:now.slice(0,10)}).asOf,date);
});
test('NAVER collection retains OHLC/volume and journals enrichments before the forecast origin',async()=>{
 const input=fixture(),date=input.actualAsOf,before=JSON.stringify(input);input.newsSchema=1;
 const xml=`<chartdata symbol="005930"><item data="${date.replaceAll('-','')}|100|110|90|105|500"/></chartdata>`;
 const row=parseNaver(xml,'005930',date,input.calendar.sessions)[0];assert.deepEqual([row.open,row.high,row.low,row.volume],[100,110,90,500]);
 const priorDate=input.calendar.sessions.at(-5);const p=input.assets[0].prices.find(p=>p.date===priorDate);p.close=105;delete p.volume;delete p.open;delete p.high;delete p.low;input.origin=date;
 const olderXml=xml.replace(date.replaceAll('-',''),priorDate.replaceAll('-',''));
 const next=await collectActual(input,{now:new Date(date+'T17:00:00+09:00'),forcePriceCheck:true,fetcher:async()=>new Response(olderXml)});
 assert.equal(next.input.assets[0].prices.find(p=>p.date===priorDate).volume,500);assert.equal(next.input.priceRevisions[0].provider,'NAVER_FEATURES');
 assert.deepEqual(pricesAsOf(next.input,date+'T16:00:00+09:00'),input.assets);
});
test('validation refuses incomplete scores and future/other-company performance as calibration',()=>{
 const row={code:'005930',date:'2025-01-01',targetDate:'2025-01-15',horizon:10,featureCount:6,pointInTimeVerified:true,adjustmentsVerified:true,score:90,baseLogReturn:0,actualLogReturn:.1};
 assert.equal(evaluateFomoCandidate([row],'005930').eligible,0);assert.equal(evaluateFomoCandidate([{...row,featureCount:18,code:'000660'}],'005930').eligible,0);assert.equal(evaluateFomoCandidate([{...row,featureCount:18,targetDate:'2026-10-01'}],'005930').eligible,0);assert.equal(evaluateFomoCandidate([],'005930').liveWeight,0);
});
test('fixed ridge candidate respects nonoverlap and reports retrospective gains without enabling live price drift',()=>{
 const rows=Array.from({length:44},(_,i)=>{const start=new Date(Date.UTC(2023,0,1)+i*20*86400000),end=new Date(+start+14*86400000);return{code:'005930',date:start.toISOString().slice(0,10),targetDate:end.toISOString().slice(0,10),horizon:10,featureCount:18,pointInTimeVerified:true,adjustmentsVerified:true,score:i%2?80:20,baseLogReturn:0,actualLogReturn:i%2?.03:-.03};});
 const v=evaluateFomoCandidate(rows,'005930');assert.equal(v.status,'retrospective_research_only');assert.equal(v.nonoverlap,44);assert.ok(v.candidateMAE<v.baseMAE);assert.equal(v.enabled,false);assert.equal(v.liveWeight,0);
});
test('52 preserved forecasts and actual inputs remain intact; summaries distinguish direction and context',()=>{
 const b=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url))),before=JSON.stringify(b);
 for(const a of b.candidate.assets){const s=forecastSummary(a,b.candidate),f=calculateFomo({input:b.input,code:a.code,date:b.input.actualAsOf});assert.equal(f.total,18);assert.equal(f.score,null);assert.equal(f.available,6);assert.ok(Number.isFinite(f.priceHeat));assert.equal(s.endReturn,a.rows.at(-1).p50/a.rows[0].p50-1);const d=chartDomain(a.rows,a.rows[0].p50);assert.ok(d.hi>d.lo);for(const p of a.news)assert.ok(['direction','variance','held','context'].includes(eventState(p)));}
 assert.equal(JSON.stringify(b),before);
});

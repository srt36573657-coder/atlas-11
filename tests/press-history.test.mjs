import test from 'node:test';
import assert from 'node:assert/strict';
import {PRESS_PROTOCOL,pressSnapshot,comparePressPrice,buildPressHistoryReport} from '../lib/press-history.mjs';

const cutoff='2026-09-26T18:00:00Z';
const sessions=['2025-12-30','2026-06-30','2026-09-15','2026-09-16','2026-09-17','2026-09-23','2026-10-30'];
const source={id:'article',url:'https://example.org/record',publishedAt:'2026-09-16T16:00:00+09:00',observedAt:'2026-09-26T17:00:00Z',verification:'article_body_read',archivedOriginalAtPublicationVerified:false};
const observation={id:'d',kind:'company',stockCode:'000000',entity:'검사 기업',periodStart:null,periodEnd:'2026-09-16',periodType:'daily',metric:'price_return_pct',value:.51,unit:'percent',sourceIds:['article'],availableAt:source.publishedAt,pointInTimeOriginalVerified:false,eligibleForDailyModel:false};
function dataset(observations=[observation]){
 return {schema:'atlas-press-history-1.0',researchWindow:{from:'2016-09-17',to:'2026-09-16'},forecastWindow:{from:'2026-09-17',to:'2026-10-30'},sources:[structuredClone(source)],observations:structuredClone(observations)};
}
function input(){return {origin:'2026-09-17',end:'2026-10-30',actualAsOf:'2026-09-23',calendar:{sessions},assets:Array.from({length:52},(_,i)=>({code:String(i).padStart(6,'0'),name:'기업 '+i,sector:'업종 '+i,prices:[{date:'2025-12-30',close:100},{date:'2026-06-30',close:278.57},{date:'2026-09-15',close:100},{date:'2026-09-16',close:100.51},{date:'2026-09-17',close:101},{date:'2026-09-23',close:102}]}))};}
function version(i){return {id:'preserved-baseline',origin:'2026-09-23',end:i.end,assets:i.assets.map(a=>({code:a.code,name:a.name,originPrice:102,rows:[{date:'2026-09-23',p50:102},{date:'2026-10-30',p50:103}]}))};}
function snap(d=dataset(),at=cutoff){return pressSnapshot(d,{cutoff:at,stockCodes:input().assets.map(a=>a.code)});}

test('article collection time gates historical availability; future duplicate information cannot poison the past',()=>{
 const data=dataset();
 assert.equal(snap(data,'2026-09-17T16:00:00+09:00').observations.length,0);
 const original=snap(data);
 data.sources.push({...source,id:'future',url:'https://example.org/future',observedAt:'2026-09-29T12:00:00Z'});
 data.sources.push({...source,url:'https://example.org/later-correction',observedAt:'2026-09-29T12:00:00Z'});
 data.observations.push({...observation,sourceIds:['future'],value:99});
 assert.deepEqual(snap(data),original);
 assert.equal(snap(data,'2026-09-30T12:00:00Z').observations.length,0);
 assert.ok(snap(data,'2026-09-30T12:00:00Z').rejected.some(x=>x.reason.includes('상충')));
});

test('future publication and observation-level availability are gated independently',()=>{
 const data=dataset();data.sources[0].publishedAt='2026-09-27T02:00:00Z';
 assert.equal(snap(data).observations.length,0);
 data.sources[0].publishedAt=source.publishedAt;data.observations[0].availableAt='2026-09-28T00:00:00Z';
 assert.equal(snap(data).observations.length,0);
 data.observations[0].availableAt=source.publishedAt;data.observations[0].observedAt='2026-09-29T00:00:00Z';
 assert.equal(snap(data).observations.length,0);
});

test('adding a future corroborating source cannot remove an observation available from the original source',()=>{
 const data=dataset(),original=snap(data);
 data.sources.push({...source,id:'future-copy',observedAt:'2026-09-29T12:00:00Z'});
 data.observations[0].sourceIds.push('future-copy');
 assert.deepEqual(snap(data),original);
});

test('reprinted identical facts are counted once, while conflicting facts and IDs are excluded',()=>{
 const data=dataset([observation,{...observation,id:'copy'}]);
 const same=snap(data);assert.equal(same.observations.length,1);assert.equal(same.observations[0].duplicateObservationIds.length,1);
 data.observations[1].value=3;
 assert.equal(snap(data).observations.length,0);assert.equal(snap(data).rejected.length,2);
 data.observations[1].id=observation.id;
 assert.equal(snap(data).observations.length,0);assert.match(snap(data).rejected[0].reason,/동일 관측 ID/);
});

test('company name variants cannot multiply an observation, and visible rejections change the report identity',()=>{
 const d=dataset([observation,{...observation,id:'name-variant',entity:'검 사 기 업'}]);
 assert.equal(snap(d).observations.length,1);
 const i=input(),v=version(i),old=buildPressHistoryReport(i,v,d,{cutoff});
 d.observations.push({...observation,id:'invalid-unit',unit:'KRW'});
 const next=buildPressHistoryReport(i,v,d,{cutoff});
 assert.notEqual(next.id,old.id);assert.equal(next.counts.observations,old.counts.observations);
 assert.equal(next.rejected.length,1);
});

test('invalid units, unknown company codes, nonfinite values and a false training flag cannot become model inputs',()=>{
 const data=dataset([
  {...observation,id:'wrong-unit',unit:'KRW'},
  {...observation,id:'unknown-company',stockCode:'999999'},
  {...observation,id:'nonfinite',value:Infinity},
  {...observation,id:'extreme-valid',value:756.47,eligibleForDailyModel:true},
 ]);
 const result=snap(data);
 assert.equal(result.rejected.length,3);assert.equal(result.observations.length,1);
 assert.equal(result.observations[0].value,756.47);assert.equal(result.observations[0].eligibleForDailyModel,false);
 assert.equal(PRESS_PROTOCOL.annualToDailyConversion,false);
});

test('exact company ownership and percentage-point units are enforced in numerical comparisons',()=>{
 const a=input().assets[0],o=snap().observations[0];
 const result=comparePressPrice(o,a,sessions,{actualAsOf:'2026-09-23'});
 assert.equal(result.status,'pass');assert.equal(result.unit,'percentage_point');assert.ok(Math.abs(result.difference)<1e-12);
 a.prices.find(x=>x.date==='2026-09-16').close=100.516;
 const conflict=comparePressPrice(o,a,sessions);assert.equal(conflict.status,'warn');assert.ok(Math.abs(conflict.difference-.006)<1e-10);
 assert.throws(()=>comparePressPrice(o,{...a,code:'000001'},sessions),/다른 종목/);
 assert.equal(conflict.independentProviderVerification,false);
});

test('scientific-notation returns retain their precision instead of receiving a half-percentage-point tolerance',()=>{
 const a=input().assets[0],o={...snap().observations[0],value:1e-7};
 a.prices.find(x=>x.date==='2026-09-16').close=100.01;
 const result=comparePressPrice(o,a,sessions);
 assert.ok(result.tolerance<1e-7);assert.equal(result.status,'warn');
});

test('half-year comparison uses the previous year final session and does not manufacture a missing anchor',()=>{
 const o={...snap().observations[0],periodStart:'2026-01-01',periodEnd:'2026-06-30',periodType:'half_year',value:178.57};
 const a=input().assets[0],check=comparePressPrice(o,a,sessions);
 assert.equal(check.status,'pass');assert.deepEqual(check.referenceDates,['2025-12-30','2026-06-30']);
 a.prices=a.prices.filter(x=>x.date!=='2025-12-30');
 assert.equal(comparePressPrice(o,a,sessions).status,'missing');
 assert.equal(comparePressPrice(o,input().assets[0],sessions.filter(x=>x!=='2025-12-30')).status,'missing');
 const older={...o,periodStart:'2017-01-01',periodEnd:'2017-12-28',periodType:'annual'};
 assert.equal(comparePressPrice(older,a,sessions).status,'missing');
});

test('company A changes neither company B evidence rows nor any saved prices and forecasts',()=>{
 const i=input(),v=version(i),d=dataset(),before=structuredClone({i,v,d});
 const r=buildPressHistoryReport(i,v,d,{cutoff});
 assert.deepEqual({i,v,d},before);assert.equal(r.counts.assets,52);assert.equal(r.counts.linkedCompanies,1);
 assert.ok(r.rows.every(x=>x.effects.centerShift===0&&x.effects.priceShift===0&&x.effects.liveWeight===0&&x.effects.dailyTrainingRows===0&&x.trustProbability===null));
 d.observations[0].value=20;
 const changed=buildPressHistoryReport(i,v,d,{cutoff});
 assert.notEqual(changed.id,r.id);assert.deepEqual(changed.rows[1],r.rows[1]);
 assert.equal(changed.rows[0].evidenceDecision.status,'input_conflict');
 assert.equal(changed.rows[0].evidenceDecision.numericImpactAllowed,false);
});

test('report identity follows meaningful evidence, not the wall clock; recorded price revisions replay by cutoff',()=>{
 const i=input(),v=version(i),d=dataset();
 const first=buildPressHistoryReport(i,v,d,{cutoff});
 const later=buildPressHistoryReport(i,v,d,{cutoff:'2026-09-27T18:00:00Z'});
 assert.equal(first.id,later.id);assert.notEqual(first.informationCutoff,later.informationCutoff);
 i.priceRevisions=[{code:'000000',date:'2026-09-16',at:'2026-09-28T12:00:00Z',beforeRow:{date:'2026-09-16',close:100.51},afterRow:{date:'2026-09-16',close:90}}];
 i.assets[0].prices.find(x=>x.date==='2026-09-16').close=90;
 assert.equal(buildPressHistoryReport(i,v,d,{cutoff}).id,first.id);
 assert.notEqual(buildPressHistoryReport(i,v,d,{cutoff:'2026-09-29T18:00:00Z'}).id,first.id);
});

test('market, sector and annual context stay separate from every company return distribution',()=>{
 const d=dataset([
  {...observation,id:'market',kind:'market_index',stockCode:undefined,entity:'KOSPI',periodType:'annual',periodStart:'2025-01-01',periodEnd:'2025-12-30',value:75.6},
  {...observation,id:'sector',kind:'sector_index',stockCode:undefined,indexFamily:'KOSPI',entity:'전기전자',periodType:'annual',periodStart:'2025-01-01',periodEnd:'2025-12-30',value:127.9},
 ]);
 const i=input(),r=buildPressHistoryReport(i,version(i),d,{cutoff});
 assert.equal(r.marketSummary[0].annual.mean,75.6);assert.equal(r.sectorSummary[0].officialMapping,false);
 assert.equal(r.counts.companyObservations,0);assert.ok(r.rows.every(x=>x.observations.length===0&&x.priceChecks.length===0));
 assert.equal(r.eligibility.appliedToPriceDirection,false);
});

test('fixed dates and the exact 52-company universe cannot be silently changed',()=>{
 const i=input(),d=dataset();
 assert.throws(()=>buildPressHistoryReport({...i,end:'2026-11-30'},version(i),d,{cutoff}),/52종목/);
 const v=version(i);v.assets[0].code='999999';
 assert.throws(()=>buildPressHistoryReport(i,v,d,{cutoff}),/일치/);
 d.forecastWindow.to='2026-11-30';assert.throws(()=>snap(d),/고정 기간/);
 assert.throws(()=>pressSnapshot(dataset(),{cutoff:'2026-09-26T18:00:00'}),/시간대/);
});

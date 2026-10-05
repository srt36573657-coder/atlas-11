import test from 'node:test';
import assert from 'node:assert/strict';
import {component,mounted} from './helpers/factor36-ui.mjs';

const keys=['rawSource','collector','history','calculation','ui','validation'];
function fixture(){
  const factors=Array.from({length:36},(_,i)=>({id:`F${String(i+1).padStart(2,'0')}`,name:`요인 ${i+1}`,rawSourceStocks:0,usedStocks:i<3?52:0}));
  const stocks=Array.from({length:52},(_,i)=>({code:String(i+1).padStart(6,'0'),name:`기업 ${i+1}`,sector:`업종 ${i%5+1}`,
    factors:factors.map((factor,j)=>({...factor,...Object.fromEntries(keys.map(key=>[key,{status:key==='calculation'&&j<3?'ready':key==='rawSource'&&j<3?'partial':'missing',reason:`기업 ${i+1} ${factor.id} ${key} 원문 확인 기록`,...(key==='rawSource'?{sources:[{url:'https://example.org/official',title:`기업 ${i+1} 출처`,rawHash:'a'.repeat(64),observedAt:'2026-09-28T01:00:00Z'}]}:{})}]))})),
    fomo:{score:i===1?0:null,asOf:'2026-09-23',...Object.fromEntries(keys.map(key=>[key,{status:i===1?'ready':'missing',reason:`기업 ${i+1} FOMO ${key} 기록`}]))}}));
  return {schema:'atlas-completion-status-1',forecastId:'current-issue',generatedAt:'2026-09-28T01:00:00Z',actualAsOf:'2026-09-23',
    summary:{factorTypesWithRawSource:0,componentSourceFactorTypes:3,factorTypesUsed:3,fomoComputedStocks:1,collectedStocks:0,expectedStocks:52},
    factors,stocks,operation:{serverInstalled:false,schedulerInstalled:false,lastRunAt:null,lastRunStatus:'partial',reason:'서버에 설치되지 않아 자동 운영 중이 아닙니다.'}};
}
const version=report=>({id:report.forecastId,assets:report.stocks.map(s=>({code:s.code}))});
async function render(h,report,v=version(report)){
  const {CompletionStatus}=await component('../../src/completion-status.tsx');
  await h.render(h.React.createElement(CompletionStatus,{version:v}));
  await h.wait(()=>document.querySelector('[data-completion-state="ready"],[data-completion-state="error"]'));
}

test('completion report requires the exact current issue, original 52 codes, and 36 unique factors per stock',async()=>{
  const {validCompletionReport}=await component('../../src/completion-status.tsx'),r=fixture(),v=version(r);
  assert.equal(validCompletionReport(r,v),true);
  assert.equal(validCompletionReport(r,{...v,id:'other'}),false);
  const wrongCode=structuredClone(r);wrongCode.stocks[0].code='999999';assert.equal(validCompletionReport(wrongCode,v),false);
  const duplicate=structuredClone(r);duplicate.stocks[1].code=duplicate.stocks[0].code;assert.equal(validCompletionReport(duplicate,v),false);
  const missingFactor=structuredClone(r);missingFactor.stocks[51].factors.pop();assert.equal(validCompletionReport(missingFactor,v),false);
  const repeatedFactor=structuredClone(r);repeatedFactor.stocks[0].factors[0].id='F02';assert.equal(validCompletionReport(repeatedFactor,v),false);
});

test('completion UI separates partial source evidence from model use and gives each of 52 stocks six-stage evidence',async()=>{
  const r=fixture(),before=JSON.stringify(r);
  await mounted(async h=>{
    await render(h,r);
    assert.equal(document.querySelectorAll('[data-completion-stock]').length,52);
    assert.equal(document.querySelectorAll('[data-completion-factor]').length,37);
    const totals=document.querySelector('.completion-totals').textContent;
    assert.match(totals,/36요인 원자료 확보0 \/ 36/);assert.match(totals,/현재 계산에서 사용3종류/);assert.match(totals,/FOMO 계산 가능1 \/ 52종목/);
    const row=document.querySelector('[data-completion-factor="F01"]');
    assert.equal(row.querySelectorAll('.completion-stage').length,6);
    assert.equal(row.querySelector('.completion-stage').dataset.stageStatus,'partial');
    assert.match(row.textContent,/기업 1 F01 rawSource/);assert.equal(row.querySelector('a').href,'https://example.org/official');
    await h.click(h.button('계산 사용'));assert.equal(document.querySelectorAll('[data-completion-factor]').length,4);
    await h.click(document.querySelector('[data-completion-stock="000052"]'));
    assert.equal(document.querySelector('[data-completion-selected]').dataset.completionSelected,'000052');
    assert.match(document.querySelector('[data-completion-factor="F01"]').textContent,/기업 52 F01 rawSource/);
    assert.equal(JSON.stringify(r),before,'reading and selecting never mutates evidence');
  },{fetchImpl:async url=>{assert.equal(url,'/data/completion-status.json');return Response.json(r);}});
});

test('missing FOMO remains uncomputed while a measured score of zero is displayed as zero',async()=>{
  const r=fixture();await mounted(async h=>{
    await render(h,r);assert.match(document.querySelector('[data-completion-factor="FOMO"] summary').textContent,/점수 미산출/);
    await h.click(document.querySelector('[data-completion-stock="000002"]'));
    assert.match(document.querySelector('[data-completion-factor="FOMO"] summary').textContent,/관측 점수 0/);
    assert.doesNotMatch(document.querySelector('[data-completion-factor="FOMO"] summary').textContent,/점수 미산출/);
    assert.match(document.querySelector('.completion-operation').textContent,/서버 설치 미설치 · 예약 연결 미설치/);
    assert.match(document.querySelector('.completion-operation').textContent,/자동 운영 중이 아닙니다/);
  },{fetchImpl:async()=>Response.json(r)});
});

test('a stale or unavailable ledger never appears as evidence for the current forecast',async()=>{
  const r=fixture();await mounted(async h=>{
    await render(h,r,{...version(r),id:'newer-issue'});
    assert.equal(document.querySelector('[data-completion-state]').dataset.completionState,'error');
    assert.equal(document.querySelectorAll('[data-completion-stock]').length,0);
    assert.match(document.body.textContent,/이전 현황을 대신 표시하지 않습니다/);
  },{fetchImpl:async()=>Response.json(r)});
  await mounted(async h=>{
    await render(h,r);
    assert.equal(document.querySelector('[data-completion-state]').dataset.completionState,'error');
    assert.match(document.body.textContent,/현황을 읽지 못했습니다/);
  },{fetchImpl:async()=>new Response('not found',{status:404})});
});

test('unsafe source URLs are text only; genuine report download stays tied to the checked issue',async()=>{
  const r=fixture();r.stocks[0].factors[0].rawSource.sources=[{url:'javascript:alert(1)',title:'not a public source'}];
  await mounted(async h=>{
    await render(h,r);
    assert.equal(document.querySelector('[data-completion-factor="F01"] .completion-source a'),null);
    assert.match(document.querySelector('[data-completion-factor="F01"]').textContent,/유효한 공개 출처 주소 없음/);
    assert.equal(document.querySelector('.completion-heading a').getAttribute('download'),'ATLAS_52_Factor_Status.json');
    assert.equal(document.querySelector('[data-completion-forecast]').dataset.completionForecast,'current-issue');
  },{fetchImpl:async()=>Response.json(r)});
});

test('daily reports keep no-observation performance uncomputed and reject a different issuance',async()=>{
  const report={schema:'atlas-completion-daily-score-1',forecastId:'current-issue',byDate:[]};
  await mounted(async h=>{
    const {CompletionDailyReport}=await component('../../src/completion-status.tsx');
    await h.render(h.React.createElement(CompletionDailyReport,{version:{id:'current-issue'}}));
    await h.wait(()=>document.querySelector('[data-completion-daily-state="ready"]'));
    assert.match(document.body.textContent,/관측 0거래일/);
    assert.match(document.body.textContent,/맞음·틀림·적중률은 아직 미산출/);
    assert.equal(document.querySelectorAll('.completion-daily-metrics').length,0);
    await h.render(h.React.createElement(CompletionDailyReport,{version:{id:'new-issue'}}));
    await h.wait(()=>document.querySelector('[data-completion-daily-state="error"]'));
    assert.equal(document.querySelector('[data-daily-forecast]'),null);
  },{fetchImpl:async()=>Response.json(report)});
});

test('daily report shows observed counts and scores independently; price-only heat is not relabeled FOMO',async()=>{
  const r=fixture();r.stocks[0].fomo.partialMetric={name:'가격 기반 과열 부분지표',score:68.5,reason:'종가만 사용. 전체 FOMO 점수 아님.'};
  const daily={schema:'atlas-completion-daily-score-1',forecastId:r.forecastId,byDate:[{date:'2026-09-28',stocks:52,correct:20,wrong:32,hitRate:20/52,meanAbsoluteError:.013,coverage:.8,intervalScore:.04,brier:.5,commonDirectionFraction:40/52}]};
  await mounted(async h=>{
    const {CompletionDailyReport}=await component('../../src/completion-status.tsx');
    await h.render(h.React.createElement(CompletionDailyReport,{version:{id:r.forecastId}}));
    await h.wait(()=>document.querySelector('[data-completion-daily-state="ready"]'));
    assert.match(document.body.textContent,/방향 맞음 20 \/ 틀림 32/);
    assert.match(document.body.textContent,/예측 대비 절대 오차1.3%/);
    assert.match(document.body.textContent,/같은 방향 최대 비중76.9%/);
    await render(h,r);
    const fomo=document.querySelector('[data-completion-factor="FOMO"]');
    assert.match(fomo.querySelector('summary').textContent,/점수 미산출/);
    assert.match(fomo.textContent,/가격 기반 과열 부분지표 68.5/);
    assert.match(fomo.textContent,/전체 FOMO 점수 아님/);
  },{fetchImpl:async url=>Response.json(url.includes('daily-score')?daily:r)});
});

test('newspaper evidence filters each observation to its own stock or explicit market scope, never sibling-company rows',async()=>{
 const base={sourceBodyRead:true,snapshotVerified:true,url:'https://example.org/article',publisher:'신문',title:'원문 제목',publicationDate:'2026-09-20',publicationTimeVerified:false,knownToAtlasAt:'2026-09-28T06:45:00Z',numericImpactAllowed:false};
 const own={metric:'retail_net_buy_amount',value:123,unit:'KRW_100m',scope:'company',targetCodes:['000001'],aggregation:'period_sum',startDate:'2026-09-01',endDate:'2026-09-20',rawNumericObservationUsable:true,reason:'일별 이력 미확보'};
 const other={...own,targetCodes:['000002'],value:987654321};
 const market={...own,metric:'investor_deposit_balance',scope:'market',targetCodes:[],value:456};
 const report={schema:'atlas-newspaper-evidence-1',sources:[{...base,id:'mixed',targetCodes:['000001','000002'],observations:[own,other,market]},{...base,id:'unread',sourceBodyRead:false,observations:[own]}]};
 const {newspaperForStock,NewspaperEvidence}=await component('../../src/completion-status.tsx');
 assert.deepEqual(newspaperForStock(report,'000001')[0].observations.map(o=>o.value),[123,456]);
 assert.deepEqual(newspaperForStock(report,'000002')[0].observations.map(o=>o.value),[987654321,456]);
 await mounted(async h=>{
  await h.render(h.React.createElement(NewspaperEvidence,{code:'000001',name:'기업 1'}));
  await h.wait(()=>document.querySelector('[data-newspaper-source="mixed"]'));
  assert.equal(document.querySelectorAll('[data-newspaper-source]').length,1);
  assert.equal(document.querySelectorAll('[data-newspaper-target="000001"]').length,1);
  assert.equal(document.querySelectorAll('[data-newspaper-target="market"]').length,1);
  assert.doesNotMatch(document.body.textContent,/987,654,321/);
  assert.match(document.body.textContent,/기간 합계 · 일별값 아님/);
  assert.match(document.body.textContent,/현재 전망 계산에 미반영/);
  assert.match(document.body.textContent,/ATLAS 확인/);
  assert.equal(document.querySelector('[data-newspaper-source] a').href,'https://example.org/article');
 },{fetchImpl:async()=>Response.json(report)});
});

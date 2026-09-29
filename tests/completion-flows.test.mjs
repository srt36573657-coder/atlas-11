import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {flowNumber,parseFlowCsv,importInvestorFlows,flowFeatures,importNpsHoldings,validateFlowManifest,extractKofiaSummary,collectFlowSources} from '../lib/completion-flows.mjs';
const body=Buffer.from('official fixture; synthetic test values, not market observations');
const meta={sourceUrl:'https://data.krx.co.kr/contents/MDC/MAIN/main/index.cmd',rawHash:createHash('sha256').update(body).digest('hex'),observedAt:'2026-09-28T07:00:00Z',publishedAt:'2026-09-28T06:00:00Z',licensingStatus:'permitted'};
const codes=['005930','000720'];
const opts={codes,body};
const row=(investor,netBuy,extra={})=>({code:'005930',date:'2026-09-23',investor,netBuy,unit:'KRW_million',...extra});

test('flow missing values never become zero; grouping and signed units parse',()=>{
 assert.equal(flowNumber('-1,234.25'),-1234.25);assert.equal(flowNumber('0'),0);
 for(const x of ['',null,'-','N/A','12,34','Infinity',NaN])assert.throws(()=>flowNumber(x));
});
test('CSV parser preserves code leading zeros and quoted thousands',()=>{
 assert.deepEqual(parseFlowCsv('\uFEFFcode,value\r\n005930,"1,250"\r\n'),[{code:'005930',value:'1,250'}]);
 assert.throws(()=>parseFlowCsv('a,a\n1,2'),'duplicate header');assert.throws(()=>parseFlowCsv('a,b\n"x,2'),'unclosed quotes');
});
test('official raw bytes and company membership enforced',()=>{
 assert.throws(()=>importInvestorFlows([row('retail',100)],meta,{codes,body:Buffer.from('tampered')}),/HASH_MISMATCH/);
 assert.throws(()=>importInvestorFlows([row('retail',100,{code:'999999'})],meta,opts),/TARGET/);
 assert.throws(()=>importInvestorFlows([row('retail',100)],{...meta,sourceUrl:'https://example.com'},opts),/UNAPPROVED_SOURCE/);
 assert.throws(()=>importInvestorFlows([row('retail',100)],{...meta,code:'000720'},opts),/RESERVED_METADATA/);
});
test('aggregate pension cannot be imported as National Pension Service',()=>{
 assert.throws(()=>importInvestorFlows([row('national_pension_service',100)],meta,opts),/INVESTOR|NPS/);
 const data=importInvestorFlows([row('pension_funds_etc',100)],meta,opts);
 assert.equal(data[0].investor,'pension_funds_etc');assert.equal(data[0].pointInTimeVerified,false);
});
test('investor record duplicate identical dedup and conflicting corrections refuse',()=>{
 assert.equal(importInvestorFlows([row('foreign',-30),row('foreign',-30)],meta,opts).length,1);
 assert.throws(()=>importInvestorFlows([row('foreign',-30),row('foreign',40)],meta,opts),/CONFLICT/);
});
test('institution excludes pension and uses prior turnover without clipping negative values',()=>{
 const rs=importInvestorFlows([row('institution_total',-10),row('pension_funds_etc',30),row('retail',-80),row('foreign',90)],meta,opts);
 const t=[{code:'005930',date:'2026-09-22',value:1e8,unit:'KRW',publishedAt:meta.publishedAt,observedAt:meta.observedAt},{code:'005930',date:'2026-09-23',value:1,unit:'KRW',publishedAt:meta.publishedAt,observedAt:meta.observedAt}];
 const features=flowFeatures(rs,t,{asOf:meta.observedAt,codes});assert.equal(features.length,4);
 assert.equal(features.find(f=>f.factorId==='F16').value,-.4);
 assert.equal(features.find(f=>f.factorId==='F19').value,-.8);
 assert.ok(features.every(f=>f.denominatorDate==='2026-09-22'&&f.usedInForecast===false));
});
test('unknown pension or absent prior denominator cannot fabricate institution ex pension',()=>{
 const rs=importInvestorFlows([row('institution_total',-10)],meta,opts);
 assert.deepEqual(flowFeatures(rs,[],{asOf:meta.observedAt,codes}),[]);
});
test('unpublished or future observed rows are unavailable at historical cutoffs',()=>{
 const t=[{code:'005930',date:'2026-09-22',value:1e8,unit:'KRW',publishedAt:meta.publishedAt,observedAt:meta.observedAt}];
 assert.deepEqual(flowFeatures(importInvestorFlows([row('retail',20)],{...meta,publishedAt:null},opts),t,{asOf:meta.observedAt,codes}),[]);
 assert.deepEqual(flowFeatures(importInvestorFlows([row('retail',20)],meta,opts),t,{asOf:'2026-09-27T07:00:00Z',codes}),[]);
});
test('NPS holding stock and daily flow cannot be confused; omitted companies remain null',()=>{
 const nps={...meta,sourceUrl:'https://fund.nps.or.kr/fileDown.do?atchFileId=fixture',publishedAt:null};
 const r=importNpsHoldings([{name:'삼성전자',holdingFraction:.08,valuationKRW100m:30,assetWeight:.2}],nps,{assets:[{code:'005930',name:'삼성전자'},{code:'000720',name:'현대건설'}],year:2025,body});
 assert.equal(r.matches[0].notDailyFlow,true);assert.equal(r.matches[0].date,'2025-12-31');assert.equal(r.missing[0].value,null);
 assert.throws(()=>importNpsHoldings([{name:'삼성전자',holdingFraction:8,valuationKRW100m:30,assetWeight:.2}],nps,{assets:[{code:'005930',name:'삼성전자'}],year:2025,body}),/VALUE_RANGE/);
});
test('zero outstanding supply and unverified index membership cannot pass import',()=>{
 const base={id:'x',factorId:'F24',scope:'company',targetCodes:['005930'],source:meta,outstandingVerified:true,remainingShares:0};
 assert.throws(()=>validateFlowManifest({schema:'atlas-flow-export-1',datasets:[base]},{codes}),/NO_OUTSTANDING/);
 assert.throws(()=>validateFlowManifest({schema:'atlas-flow-export-1',datasets:[{...base,factorId:'F22',scope:'index'}]},{codes}),/INDEX_MEMBERSHIP/);
});
test('NPS actual archived source extraction preserves yearly units and all matched companies',()=>{
 const input=JSON.parse(fs.readFileSync(new URL('../reports/completion/flows-nps-extracted.json',import.meta.url)));
 const assets=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url))).input.assets;
 const expected={2021:45,2022:49,2023:51,2024:52,2025:52};
 for(const d of input.datasets){
   const result=importNpsHoldings(d.rows,d.source,{assets,year:d.year,body:fs.readFileSync(new URL('../'+d.source.rawFile,import.meta.url))});
   assert.equal(result.matches.length,expected[d.year]);assert.equal(result.matches.length+result.missing.length,52);
   assert.ok(result.matches.every(x=>x.value>=0&&x.value<=1&&x.notDailyFlow&&x.pointInTimeVerified===false));
   const samsung=result.matches.find(x=>x.code==='005930');
   assert.ok(Math.abs(samsung.value-({2021:.0852,2022:.0753,2023:.0728,2024:.0726,2025:.0776}[d.year]))<1e-12);
 }
});
test('KOFIA actual market aggregates retain units and cannot claim stock-level credit',()=>{
 const html=fs.readFileSync(new URL('../reports/completion/raw-flows/kofia-main.bin',import.meta.url),'utf8');
 const source={...meta,sourceUrl:'https://freesis.kofia.or.kr/stat/main.do',rawHash:createHash('sha256').update(html).digest('hex'),publishedAt:null};
 const dateEvidenceText=fs.readFileSync(new URL('../reports/completion/raw-flows/web-primary-bodies.txt',import.meta.url),'utf8'),dateEvidenceHash=createHash('sha256').update(dateEvidenceText).digest('hex');
 const rows=extractKofiaSummary(html,source,{year:2026,dateEvidenceText,dateEvidenceHash});assert.equal(rows[0].value,100982555);assert.equal(rows[1].value,32819168);assert.equal(rows[1].change,-236317);assert.equal(rows[1].companySpecific,false);assert.equal(rows[1].unit,'KRW_million');
 assert.throws(()=>extractKofiaSummary(html,source,{year:2027}),/YEAR_NOT_CONFIRMED/);
});
test('flow collector keeps access failures and error pages separate from source acquisition',async()=>{
 let attempts=0;const r=await collectFlowSources({fetchImpl:async()=>{attempts++;return new Response('Access Denied',{status:403});}});
 assert.equal(attempts,2);assert.equal(r.exitCode,2);assert.equal(r.newApprovedFactorRecords,0);assert.ok(r.results.every(x=>x.error==='HTTP_403'));
 const html=await collectFlowSources({fetchImpl:async()=>new Response('에러가 발생하였습니다',{status:200})});assert.equal(html.exitCode,2);
});
test('flow collector enforces streaming size and archives only successfully validated bodies',async()=>{
 let raw=0;const r=await collectFlowSources({fetchImpl:async url=>new Response(url.includes('nps')?'국내주식 fileDown.do':'투자자예탁금 OS0026'),onRaw:async()=>{raw++;}});
 assert.equal(r.exitCode,0);assert.equal(raw,2);assert.equal(r.newApprovedFactorRecords,0);
 const big=await collectFlowSources({fetchImpl:async()=>new Response('abcdefghijklmn'),maxBytes:5});assert.ok(big.results.every(x=>x.error==='FLOW_BODY_TOO_LARGE'));
});

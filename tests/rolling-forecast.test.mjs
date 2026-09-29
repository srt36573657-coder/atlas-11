import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {rollingInput,rollingCSV,validateRollingPublication,persistRollingForecast,readRollingPublications,koreanDate} from '../lib/rolling-forecast.mjs';

function sessions(){const out=[];for(let d=new Date('2026-05-01');out.length<100;d.setUTCDate(d.getUTCDate()+1))if(![0,6].includes(d.getUTCDay()))out.push(d.toISOString().slice(0,10));return out;}
function fixture(){
 const dates=sessions(),actualAsOf=dates[69],futureDates=dates.slice(70,90),issuedAt=actualAsOf+'T07:00:00.000Z',id=actualAsOf+'-rolling20-'+'a'.repeat(16);
 const assets=Array.from({length:52},(_,i)=>{const code=String(i+1).padStart(6,'0'),close=1000+i*137,actual60=dates.slice(10,70).map(date=>({date,close}));return {code,name:'기업'+i,sector:'업종',anchor:{date:actualAsOf,close},actual60,rows:[{date:actualAsOf,p10:close,p50:close,p90:close,mean:close,anchor:true},...futureDates.map((date,j)=>({date,p10:close*(.98-j*.001),p50:close*(1+j*.001),p90:close*(1.02+j*.002)}))],previous:null,csvUrl:'/downloads/rolling/'+id+'/ATLAS_'+code+'_'+actualAsOf.replaceAll('-','')+'.csv'};});
 return {schema:'atlas-rolling-forecast-1',id,issuedAt,actualAsOf,horizon:20,futureDates,assets,provenance:{semanticSHA256:'a'.repeat(64),implementationSHA256:'b'.repeat(64)},summary:{stocks:52}};
}
function bundle(){const p=fixture(),dates=sessions();return {input:{actualAsOf:p.actualAsOf,calendar:{sessions:dates,status:'verified test fixture',sources:['https://example.org/test-calendar'],holidays:{}},assets:p.assets.map(a=>({code:a.code,prices:dates.slice(0,70).map(date=>({date,close:a.anchor.close}))}))}};}

test('52개 각자의 실제 종가와 첫점 일치, CSV는 미래20점만 포함한다',()=>{
 const p=fixture();assert.equal(validateRollingPublication(p),true);
 assert.equal(new Set(p.assets.map(a=>a.anchor.close)).size,52);
 for(const a of p.assets){const lines=rollingCSV(a).trim().split('\r\n');assert.equal(lines.length,21);assert.equal(lines[1].split(',')[0],p.futureDates[0]);assert.equal(lines.at(-1).split(',')[0],p.futureDates.at(-1));}
 const wrong=structuredClone(p);wrong.assets[51].rows[0].p50++;assert.throws(()=>validateRollingPublication(wrong),/ANCHOR_DIFFERENCE/);
});

test('종목 수·거래일·휴장일·실제 가격 결측·미래 관측을 엄격히 거부한다',()=>{
 const b=bundle(),issuedAt=fixture().issuedAt;
 assert.equal(rollingInput(b,{issuedAt}).futureDates.length,20);
 const short=structuredClone(b);short.input.assets.pop();assert.throws(()=>rollingInput(short,{issuedAt}),/52_CONTRACT/);
 const holiday=structuredClone(b);holiday.input.calendar.holidays[holiday.input.calendar.sessions.at(-1)]='휴장';assert.throws(()=>rollingInput(holiday,{issuedAt}),/CALENDAR_CONTRACT/);
 const weekend=structuredClone(b);weekend.input.calendar.sessions.push('2027-01-02');assert.throws(()=>rollingInput(weekend,{issuedAt}),/CALENDAR_CONTRACT/);
 const gap=structuredClone(b);gap.input.assets[3].prices.pop();assert.throws(()=>rollingInput(gap,{issuedAt}),/OBSERVED_HISTORY_GAP/);
 const future=structuredClone(b);future.input.assets[3].prices.at(-1).observedAt='2027-01-01T00:00:00Z';assert.throws(()=>rollingInput(future,{issuedAt}),/FUTURE_OBSERVATION/);
 const missingCalendar=structuredClone(b);missingCalendar.input.calendar.sessions=missingCalendar.input.calendar.sessions.slice(0,75);assert.throws(()=>rollingInput(missingCalendar,{issuedAt}),/CALENDAR_20_REQUIRED/);
 assert.throws(()=>rollingInput(b,{issuedAt:b.input.actualAsOf+'T01:00:00Z'}),/CLOSE_NOT_FINAL/);
});

test('동일 입력 재발행은 원래 시간·파일을 재사용하고 조건 없는 덮어쓰기를 거부한다',async()=>{
 const rootDir=await fs.mkdtemp(path.join(os.tmpdir(),'atlas-rolling-'));
 try{
  const p=fixture(),first=await persistRollingForecast(p,{rootDir,expectedLatestId:null});assert.equal(first.reused,false);assert.equal(first.createdForecastFiles,52);
  const after=structuredClone(p);after.issuedAt=new Date(Date.parse(p.issuedAt)+86400000).toISOString();after.assets.forEach(a=>a.csvUrl=a.csvUrl.replace(koreanDate(p.issuedAt).replaceAll('-',''),koreanDate(after.issuedAt).replaceAll('-','')));
  const reuse=await persistRollingForecast(after,{rootDir,expectedLatestId:p.id});assert.equal(reuse.reused,true);assert.equal(reuse.issuedAt,p.issuedAt);assert.equal(reuse.createdForecastFiles,0);
  assert.deepEqual(await readRollingPublications(rootDir),[p]);
  await assert.rejects(persistRollingForecast(p,{rootDir,expectedLatestId:null}),/LATEST_CONFLICT/);
  const csv=path.join(rootDir,'public',p.assets[0].csvUrl);await fs.writeFile(csv,'tampered');
  await assert.rejects(persistRollingForecast(p,{rootDir,expectedLatestId:p.id}),/IMMUTABLE_CONFLICT/);
 }finally{await fs.rm(rootDir,{recursive:true,force:true});}
});

test('새 발행본은 기존 발행본을 보관하고 가짜 전일 전망을 거부한다',async()=>{
 const rootDir=await fs.mkdtemp(path.join(os.tmpdir(),'atlas-rolling-'));
 try{
  const p=fixture();await persistRollingForecast(p,{rootDir,expectedLatestId:null});
  const next=structuredClone(p);next.id=next.id.replace('a'.repeat(16),'c'.repeat(16));next.provenance.semanticSHA256='c'.repeat(64);next.assets.forEach(a=>a.csvUrl=a.csvUrl.replace(p.id,next.id));
  await persistRollingForecast(next,{rootDir,expectedLatestId:p.id});const versions=await readRollingPublications(rootDir);assert.equal(versions.length,2);assert.deepEqual(versions.find(x=>x.id===p.id),p);
  const bad=structuredClone(p);bad.assets[0].previous={id:p.id,issuedAt:p.issuedAt,source:'immutable_published_forecast'};assert.throws(()=>validateRollingPublication(bad),/PREVIOUS_NOT_PRIOR/);
 }finally{await fs.rm(rootDir,{recursive:true,force:true});}
});

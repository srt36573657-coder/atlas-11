import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {validateRollingPublication,koreanDate} from '../lib/rolling-forecast.mjs';
import {nextTradingSessions,priorTradingSession,validateRollingCalendar} from '../lib/rolling-calendar.mjs';
import {adoptionDecision} from '../lib/rolling-backtest.mjs';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const hash=value=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
const before=read('reports/rolling/qa-before-preservation.json');
const originalHash='1af446f745c88cfb308de348f238f2fa8d31265b5322e2f035f5aafb6d5833ca';

// These checks use the real saved issuance and archives. Synthetic model tests are elsewhere.
test('rolling integration preserves original, all pre-change vintages, and the original 52 identities',()=>{
 const bundle=read('public/data/atlas.json');
 assert.equal(hash(bundle.original),originalHash);
 assert.deepEqual(bundle.input.assets.map(a=>a.code),before.codes);
 const archived=[bundle.original,bundle.candidate,...bundle.priorVersions];
 for(const vintage of [before.candidate,...before.priorVersions]){
  const found=archived.find(p=>p.id===vintage.id);
  assert.ok(found,'missing archived '+vintage.id);assert.equal(hash(found),vintage.sha256);
 }
 const oldFactor=read('reports/factor36/versions/'+before.wave.id+'.json');
 assert.equal(hash(oldFactor),before.wave.sha256);
});

test('real rolling issuance has 52 own observed anchors and 20 bounded trading-session targets',()=>{
 const bundle=read('public/data/atlas.json'),publication=read('public/data/rolling-forecast.json'),calendar=read('public/data/rolling-calendar.json');
 assert.equal(validateRollingPublication(publication),true);
 assert.deepEqual(publication.assets.map(a=>a.code),before.codes);
 assert.deepEqual(publication.futureDates,nextTradingSessions(calendar,publication.actualAsOf,20));
 assert.equal(publication.provenance.priorForecastUsedAsNumericInput,false);
 const expectedHistory=calendar.sessions.filter(d=>d<=publication.actualAsOf).slice(-60);
 for(const asset of publication.assets){
  const source=bundle.input.assets.find(a=>a.code===asset.code);
  assert.equal(asset.name,source.name);assert.equal(asset.sector,source.sector);
  assert.equal(asset.anchor.close,source.prices.find(p=>p.date===publication.actualAsOf).close);
  assert.equal(asset.rows[0].p50-asset.anchor.close,0);
  assert.deepEqual(asset.actual60.map(p=>p.date),expectedHistory);
  for(const row of asset.actual60)assert.equal(row.close,source.prices.find(p=>p.date===row.date).close);
  assert.equal(asset.rows.length,21);assert.deepEqual(asset.rows.slice(1).map(r=>r.date),publication.futureDates);
  assert.equal(asset.model.stateUpdatedThrough,publication.actualAsOf);
  assert.equal(asset.model.trustProbability,null);
 }
 assert.equal(publication.audit.deletedForLoss,0);
 assert.equal(publication.audit.independentAccuracyTests,0);
});

test('saved CSVs are 52 actual per-stock forecast files with exact cells and immutable archive hashes',()=>{
 const publication=read('public/data/rolling-forecast.json'),directory=path.join('public/downloads/rolling',publication.id),manifest=read(path.join(directory,'manifest.json'));
 assert.equal(manifest.id,publication.id);assert.equal(manifest.files.length,52);
 assert.equal(fs.readdirSync(directory).filter(f=>f.endsWith('.csv')).length,52);
 assert.equal(hash(read('reports/rolling/versions/'+publication.id+'.json')),hash(publication));
 for(const asset of publication.assets){
  const basename='ATLAS_'+asset.code+'_'+koreanDate(publication.issuedAt).replaceAll('-','')+'.csv';
  const bytes=fs.readFileSync(path.join(directory,basename)),meta=manifest.files.find(f=>f.code===asset.code);
  assert.equal(hash(bytes),meta.sha256);assert.equal(meta.futurePoints,20);
  const lines=bytes.toString('utf8').replace(/^\uFEFF/,'').trim().split(/\r?\n/);
  assert.equal(lines[0],'날짜,예측값,상단,하단');assert.equal(lines.length,21);
  for(let i=0;i<20;i++){
   const [date,value,upper,lower]=lines[i+1].split(','),r=asset.rows[i+1];
   assert.equal(date,r.date);assert.equal(Number(value),r.p50);assert.equal(Number(upper),r.p90);assert.equal(Number(lower),r.p10);
  }
 }
});

test('issuance date is not backdated and stored closes are not reported as current-day prices',()=>{
 const p=read('public/data/rolling-forecast.json');
 assert.equal(p.currentDateKST,koreanDate(p.issuedAt));
 assert.equal(p.provenance.backdatedIssuance,false);
 if(p.actualAsOf!==p.currentDateKST){assert.equal(p.dataStatus,'stored_close');assert.equal(p.summary.newCurrentCloseStocks,0);}
 else {assert.equal(p.dataStatus,'current_close');assert.equal(p.summary.newCurrentCloseStocks,52);}
 assert.equal(p.summary.trustProbability,null);assert.equal(p.summary.liveAdvantageProven,false);
});

test('the previous line can only reference a genuinely earlier publication from the preceding issuance session',()=>{
 const p=read('public/data/rolling-forecast.json'),calendar=read('public/data/rolling-calendar.json');
 const previousDay=calendar.sessions.filter(d=>d<koreanDate(p.issuedAt)).at(-1);
 for(const a of p.assets){
  if(!a.previous){assert.match(a.previousReason,/실제 발행/);continue;}
  const v=read('reports/rolling/versions/'+a.previous.id+'.json');
  assert.equal(koreanDate(v.issuedAt),previousDay);assert.ok(Date.parse(v.issuedAt)<Date.parse(p.issuedAt));
  assert.deepEqual(a.previous.rows,v.assets.find(x=>x.code===a.code).rows);
  assert.equal(a.previous.source,'immutable_published_forecast');
 }
 assert.equal(p.summary.previousForecastStocks,p.assets.filter(a=>a.previous).length);
});

test('daily error ledger has four real lookback cells per each of the original 52 stocks',()=>{
 const score=read('public/data/rolling-scores.json'),calendar=read('public/data/rolling-calendar.json'),bundle=read('public/data/atlas.json');
 assert.deepEqual(score.assets.map(a=>a.code),before.codes);assert.deepEqual(score.horizons,[1,5,10,20]);
 assert.equal(score.stockRowsAreIndependent,false);
 assert.equal(score.independentDateCount,score.byDate.filter(d=>d.evaluatedStocks>0).length);
 for(const stock of score.assets){
  assert.deepEqual(Object.keys(stock.horizons),['1','5','10','20']);
  for(const h of score.horizons){
   const cell=stock.horizons[h];assert.equal(cell.horizon,h);assert.equal(cell.originDate,priorTradingSession(calendar,score.targetDate,h));
   if(cell.status==='pending'){assert.equal(cell.ape,null);assert.equal(cell.actual,null);assert.ok(cell.reason);}
   else {
    const actual=bundle.input.assets.find(a=>a.code===stock.code).prices.find(p=>p.date===cell.targetDate).close;
    assert.equal(cell.actual,actual);assert.equal(cell.ape,Math.abs(cell.forecast-actual)/actual*100);
    assert.ok(Date.parse(cell.issuedAt)<Date.parse(cell.targetDate+'T15:30:00+09:00'));
   }
  }
 }
});

test('calendar rolling targets omit confirmed holidays and fail beyond reviewed coverage',()=>{
 const c=read('public/data/rolling-calendar.json');assert.equal(validateRollingCalendar(c),c);
 assert.equal(nextTradingSessions(c,'2026-09-23').at(-1),'2026-10-27');
 assert.equal(nextTradingSessions(c,'2026-09-28').at(-1),'2026-10-28');
 assert.equal(nextTradingSessions(c,'2026-10-30').at(-1),'2026-11-27');
 assert.equal(priorTradingSession(c,'2026-09-28',1),'2026-09-23');
 for(const d of ['2026-09-24','2026-09-25','2026-10-05','2026-10-09'])assert.ok(!c.sessions.includes(d));
 assert.throws(()=>nextTradingSessions(c,c.sessions.at(-1)),/COVERAGE_EXHAUSTED/);
});

test('completed A/B report keeps the declared 120 origins, six blocks, and adoption rule',()=>{
 const latest=read('reports/rolling/ab-latest.json'),result=read(latest.resultFile),dir=path.dirname(latest.resultFile),protocolBytes=fs.readFileSync(path.join(dir,'protocol.json'));
 assert.equal(hash(protocolBytes),result.protocolSHA256);
 assert.equal(result.originDays,120);assert.equal(result.blocks,6);assert.equal(result.stocks,52);
 assert.equal(result.stockTargetRows,120*52*20);
 const actualDecision=adoptionDecision(result.A,result.B);assert.equal(result.decision.selected,actualDecision.selected);
 assert.equal(hash(gunzipSync(fs.readFileSync(result.ledger.file))),result.ledger.uncompressedSHA256);
 assert.equal(result.ledger.rows,result.stockTargetRows);
 if(result.A.meanErrorPct===result.B.meanErrorPct)assert.equal(result.decision.selected,'A');
});

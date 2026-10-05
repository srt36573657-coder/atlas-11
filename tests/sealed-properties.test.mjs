import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {intervalScore,classifyDirection,scoreLine,scorePairedLines} from '../lib/paired-score.mjs';
import {verifyCase,CATEGORIES} from '../scripts/validate_sealed_study.mjs';

const line=(center,half=.1)=>({status:'ESTIMATED',centerReturn:center,price:100*(1+center),lowerReturn:center-half,upperReturn:center+half});
test('interval score agrees with exact integer-distance oracle across tiny and huge binary units',()=>{
  for(const exponent of [-1000,-900,-100,-10,0,10,100,900,1000]){
    const unit=2**exponent;
    for(const [l,u,y] of [[-4,8,-10],[-4,8,2],[-4,8,11],[3,3,3]]){
      const distance=y<l?BigInt(l-y):y>u?BigInt(y-u):0n;
      const exact=BigInt(u-l)+8n*distance;
      assert.equal(intervalScore(l*unit,u*unit,y*unit,.25),Number(exact)*unit);
    }
  }
});
test('common benchmark shift preserves errors and inclusion without creating an ex-ante benchmark prediction',()=>{
  for(const market of [-.3,0,.1,.5]){
    const forecast=.08,actual=.04,lower=-.02,upper=.18;
    assert.ok(Math.abs((forecast-market)-(actual-market)-(forecast-actual))<1e-15);
    assert.equal(actual>=lower&&actual<=upper,actual-market>=lower-market&&actual-market<=upper-market);
    assert.ok(Math.abs(intervalScore(lower,upper,actual)-intervalScore(lower-market,upper-market,actual-market))<1e-14);
  }
});
test('both equally wide intervals can contain actual and tie while center errors differ',()=>{
  const a=line(0),b=line(.04),actual=.01;
  const pair=scorePairedLines(a,b,actual);
  assert.equal(pair.paired,true);
  assert.equal(pair.intervalImprovementPP,0);
  assert.ok(pair.centerImprovementPP<0);
});
test('unestimable B is not converted into a zero-effect success or common paired denominator',()=>{
  const b={status:'UNESTIMABLE',centerReturn:null,price:null,lowerReturn:null,upperReturn:null};
  assert.equal(scoreLine(b,0),null);
  const pair=scorePairedLines(line(0),b,0);
  assert.ok(pair.a);assert.equal(pair.b,null);assert.equal(pair.paired,false);
  assert.equal(pair.centerImprovementPP,null);assert.equal(pair.intervalImprovementPP,null);
});
test('invalid numerical input is never coerced to an observed zero or infinite score',()=>{
  for(const value of [null,undefined,'0',NaN,Infinity,-Infinity,{},[]]){
    assert.equal(intervalScore(value,1,0,.2),null);
    assert.equal(intervalScore(0,1,value,.2),null);
    assert.equal(classifyDirection(value),null);
  }
  assert.equal(intervalScore(-1e308,1e308,0,.2),null);
  for(const alpha of [0,1,-.1,2,null,NaN])assert.equal(intervalScore(0,1,0,alpha),null);
  assert.equal(scoreLine({...line(0),price:0},0),null);
  assert.equal(scoreLine(line(0),-1),null);
});
test('direction thresholds use raw values and preserve both boundary points as flat',()=>{
  assert.equal(classifyDirection(.001,.001),'FLAT');assert.equal(classifyDirection(-.001,.001),'FLAT');
  assert.equal(classifyDirection(.0010000001,.001),'UP');assert.equal(classifyDirection(-.0010000001,.001),'DOWN');
  assert.equal(classifyDirection(-0,0),'FLAT');assert.equal(classifyDirection(0,-.001),null);
});
test('finite interval penalty survives tiny alpha when only reciprocal alpha would overflow',()=>{
  assert.equal(intervalScore(0,0,-1e-308,1e-308),2);
  for(const alpha of [Number.MIN_VALUE,2**-1060,2**-1040,2**-1024]){
    assert.equal(intervalScore(0,0,-alpha*13,alpha),26);
    assert.equal(intervalScore(0,0,alpha*1024,alpha),2048);
  }
});
test('seeded property sweep exercises every category using production functions',()=>{
  const counts=Object.fromEntries(CATEGORIES.map(k=>[k,0]));
  for(let i=0;i<8192;i++){const result=verifyCase(i,0x41544c41);assert.deepEqual(result.failures,[],`case ${i}`);counts[result.category]++;}
  assert.equal(Object.values(counts).every(n=>n===1024),true);
});
test('stress checkpoints count only completed cases and reject mismatched resumes',()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-sealed-stress-'));
  const output=path.join(directory,'stress.json'),runner=fileURLToPath(new URL('../scripts/validate_sealed_study.mjs',import.meta.url));
  const base=[runner,'--cases','100000','--chunk-size','1000','--seed','42','--output',output];
  try{
    const first=spawnSync(process.execPath,[...base,'--max-ms','1'],{encoding:'utf8'});
    assert.equal(first.status,2,first.stderr);const checkpoint=JSON.parse(fs.readFileSync(output,'utf8'));
    assert.equal(checkpoint.status,'PAUSED');assert.ok(checkpoint.completedCases>0&&checkpoint.completedCases<100000);
    assert.equal(Object.values(checkpoint.categoryCases).reduce((a,b)=>a+b,0),checkpoint.completedCases);
    const mismatch=spawnSync(process.execPath,[...base,'--resume','--seed','43'],{encoding:'utf8'});
    assert.equal(mismatch.status,1);assert.match(mismatch.stderr,/mismatch/);
    const resumed=spawnSync(process.execPath,[...base,'--resume'],{encoding:'utf8'});
    assert.equal(resumed.status,0,resumed.stderr);const completed=JSON.parse(fs.readFileSync(output,'utf8'));
    assert.equal(completed.completedCases,100000);assert.equal(completed.status,'PASSED');assert.equal(completed.failureCount,0);
    assert.equal(Object.values(completed.categoryCases).every(n=>n===12500),true);
    assert.equal(completed.independentMarketValidation,false);assert.equal(completed.accuracyCertification,false);
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});

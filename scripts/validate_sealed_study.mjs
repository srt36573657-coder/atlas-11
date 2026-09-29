#!/usr/bin/env node
/** Seeded arithmetic/property stress checks, never a market-accuracy certification. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {intervalScore, classifyDirection} from '../lib/paired-score.mjs';

export const METHODOLOGY = 'sealed-score-properties-1';
export const CATEGORIES = ['exact-dyadic-oracle','decimal-and-extreme-coverage-reference','translation-invariance','positive-scaling','equal-width-contained-tie','reflection-symmetry','direction-boundaries','invalid-argument-rejection'];
const here=path.dirname(fileURLToPath(import.meta.url));
const mix=(n)=>{ n=Math.imul(n^(n>>>16),0x21f0aaad);n=Math.imul(n^(n>>>15),0x735a2d97);return (n^(n>>>15))>>>0; };
const close=(a,b)=>typeof a==='number'&&Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=2e-12*Math.max(Math.abs(a),Math.abs(b),Number.MIN_VALUE)+Number.MIN_VALUE*16;

/** Each case is an indexed, reproducible property scenario, with 1–4 production calls. */
export function verifyCase(index,seed=0x41544c41){
  const category=index%CATEGORIES.length;
  const random=mix((index+seed)>>>0),random2=mix(random^0xa5a5a5a5);
  const lo=(random%200001)-100000, width=(random2%99999)+1, hi=lo+width;
  const y=(mix(random2)%400001)-200000,den=2**(1+(random>>>28)%4),alpha=1/den;
  let assertions=0,evaluations=0;
  const failures=[];
  const check=(passed,label,actual,expected)=>{assertions++;if(!passed)failures.push({label,actual,expected});};
  const score=(...args)=>{evaluations++;return intervalScore(...args);};
  const direction=(...args)=>{evaluations++;return classifyDirection(...args);};
  // Integer lattice oracle: all operations are exactly representable before binary scaling.
  const distance=y<lo?lo-y:y>hi?y-hi:0,integerExpected=width+2*den*distance;
  if(category===0){
    const unit=2**((random>>>16)%1801-900),actual=score(lo*unit,hi*unit,y*unit,alpha),expected=integerExpected*unit;
    check(actual===expected,'integer-distance dyadic oracle',actual,expected);
  }else if(category===1){
    if(random%17===0){
      const a=2**(-1074+(random2%52)),multiple=1+(random%100000),actual=score(0,0,-a*multiple,a),expected=2*multiple;
      check(actual===expected,'finite penalty despite reciprocal alpha overflow',actual,expected);
    }else{
      const unit=10**((random>>>16)%401-200),l=lo*unit,u=hi*unit,v=y*unit,a=.05+(random2%90)/100;
      const penalty=v<l?l-v:v>u?v-u:0,expected=(u-l)+penalty/(a/2),actual=score(l,u,v,a);
      check(close(actual,expected),'decimal reference',actual,expected);
    }
  }else if(category===2){
    const shift=((random2>>>10)%2000001)-1000000;
    const actual=score(lo+shift,hi+shift,y+shift,alpha),base=score(lo,hi,y,alpha);
    check(actual===base,'common translation preserves score',actual,base);
    check((lo<=y&&y<=hi)===(lo+shift<=y+shift&&y+shift<=hi+shift),'translation preserves inclusion');
  }else if(category===3){
    const unit=2**((random>>>16)%1801-900),base=score(lo,hi,y,alpha),actual=score(lo*unit,hi*unit,y*unit,alpha);
    check(actual===base*unit,'positive scale homogeneity',actual,base*unit);
  }else if(category===4){
    const center=lo,half=width,other=center+half/2,actual=center+half/4;
    const first=score(center-half,center+half,actual,alpha),second=score(other-half,other+half,actual,alpha);
    check(first===second&&first===2*half,'same-width contained intervals tie',first,second);
    const offCenter=center+half/8;
    check(Math.abs(center-offCenter)!==Math.abs(other-offCenter),'center errors can differ despite interval tie');
  }else if(category===5){
    const a=score(lo,hi,y,alpha),b=score(-hi,-lo,-y,alpha);
    check(a===b,'reflect both interval and outcome',a,b);
    const center=(lo+hi)/2,half=width/2;
    check(center-lo===hi-center&&half===hi-center,'two-sided band symmetry');
  }else if(category===6){
    const tolerance=(random%1000)/1024,unit=1/1024;
    check(direction(tolerance,tolerance)==='FLAT','upper tolerance boundary is flat');
    check(direction(-tolerance,tolerance)==='FLAT','lower tolerance boundary is flat');
    check(direction(tolerance+unit,tolerance)==='UP','above flat threshold');
    check(direction(-tolerance-unit,tolerance)==='DOWN','below flat threshold');
  }else{
    // Ten deterministic adversarial variants interleaved among seeded numeric cases.
    const k=Math.floor(index/8)%10,bad=[null,undefined,NaN,Infinity,-Infinity,'1',{},false][k%8];
    if(k<6){check(score(bad,1,0,.2)===null,'invalid bound rejected');check(direction(bad,0)===null,'invalid direction value rejected');}
    else if(k===6){check(score(1,0,0,.2)===null,'reversed interval rejected');check(direction(0,-1)===null,'negative tolerance rejected');}
    else if(k===7){check(score(0,1,0,1)===null&&score(0,1,0,0)===null,'invalid nominal coverage rejected');}
    else if(k===8){check(score(-1e308,1e308,0,.2)===null,'overflow is unavailable, not infinity');}
    else{check(score(0,1,NaN,.2)===null&&score(0,1,0,null)===null,'invalid actual or alpha rejected');}
  }
  return {category:CATEGORIES[category],assertions,evaluations,failures};
}

function parseArguments(args){
  const o={cases:1_000_000,chunkSize:100_000,seed:0x41544c41,resume:false,maxMs:0,output:path.resolve(here,'../reports/sealed-study/stress.json')};
  for(let i=0;i<args.length;i++){
    const key=args[i];if(key==='--resume'){o.resume=true;continue;}
    const value=args[++i];if(value===undefined)throw new Error(`Missing value for ${key}`);
    if(key==='--cases')o.cases=Number(value);else if(key==='--chunk-size')o.chunkSize=Number(value);else if(key==='--seed')o.seed=Number(value);else if(key==='--max-ms')o.maxMs=Number(value);else if(key==='--output')o.output=path.resolve(value);else throw new Error(`Unknown option ${key}`);
  }
  if(!Number.isSafeInteger(o.cases)||o.cases<1||o.cases>0xffffffff)throw new Error('--cases must be an integer in 1..4294967295');
  if(!Number.isSafeInteger(o.chunkSize)||o.chunkSize<1||o.chunkSize>1_000_000)throw new Error('--chunk-size must be in 1..1000000');
  if(!Number.isSafeInteger(o.seed)||o.seed<0||o.seed>0xffffffff)throw new Error('--seed must be unsigned32');
  if(!Number.isFinite(o.maxMs)||o.maxMs<0)throw new Error('--max-ms must be nonnegative');return o;
}

export function runStress(options){
  const codeHashes=Object.fromEntries(['../lib/paired-score.mjs','validate_sealed_study.mjs'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.resolve(here,file))).digest('hex')]));
  let r={schema:1,methodology:METHODOLOGY,seed:options.seed,requestedCases:options.cases,completedCases:0,propertyAssertions:0,productionEvaluations:0,categoryCases:Object.fromEntries(CATEGORIES.map(k=>[k,0])),failures:[],failureCount:0,elapsedMs:0,status:'RUNNING',codeHashes,startedAt:new Date().toISOString(),independentValidation:false,independentMarketValidation:false,accuracyCertification:false,meaning:'Seeded synthetic numerical/property cases, not independent market trials, cross-validations, or predictive accuracy.'};
  if(options.resume){
    const old=JSON.parse(fs.readFileSync(options.output,'utf8'));
    if(old.methodology!==METHODOLOGY||old.seed!==options.seed||JSON.stringify(old.codeHashes)!==JSON.stringify(codeHashes)||old.requestedCases!==options.cases)throw new Error('Checkpoint policy/code/seed/case-count mismatch; choose a separate output for a new run.');
    if(!Number.isSafeInteger(old.completedCases)||old.completedCases<0||old.completedCases>options.cases)throw new Error('Invalid checkpoint case count');
    r=old;if(r.failureCount)throw new Error('Cannot resume a failed run without preserving it and starting a new output.');
  }
  fs.mkdirSync(path.dirname(options.output),{recursive:true});
  const checkpoint=()=>{const tmp=`${options.output}.${process.pid}.tmp`;fs.writeFileSync(tmp,JSON.stringify(r,null,2)+'\n');fs.renameSync(tmp,options.output);};
  const started=performance.now();let last=started;
  while(r.completedCases<options.cases){
    const end=Math.min(options.cases,r.completedCases+options.chunkSize);
    while(r.completedCases<end){
      const i=r.completedCases,result=verifyCase(i,options.seed);
      r.categoryCases[result.category]++;r.propertyAssertions+=result.assertions;r.productionEvaluations+=result.evaluations;r.completedCases++;
      if(result.failures.length){r.failureCount+=result.failures.length;if(r.failures.length<20)r.failures.push({case:i,...result});r.status='FAILED';break;}
    }
    const current=performance.now();r.elapsedMs+=current-last;last=current;
    r.updatedAt=new Date().toISOString();r.status=r.failureCount?'FAILED':r.completedCases===options.cases?'PASSED':'RUNNING';checkpoint();
    process.stdout.write(JSON.stringify({status:r.status,completedCases:r.completedCases,requestedCases:r.requestedCases,failureCount:r.failureCount,elapsedMs:Math.round(r.elapsedMs)})+'\n');
    if(r.failureCount)break;
    if(options.maxMs&&performance.now()-started>=options.maxMs&&r.completedCases<options.cases){r.status='PAUSED';checkpoint();break;}
  }
  return r;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const r=runStress(parseArguments(process.argv.slice(2)));process.exitCode=r.status==='PASSED'?0:r.status==='FAILED'?1:2;}
  catch(e){process.stderr.write(`${e.stack||e}\n`);process.exitCode=1;}
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {fitConditionalPath} from '../lib/conditional-return.mjs';
import {training} from '../lib/engine.mjs';
import {exactOneStepDistribution,exactPriceMoments} from '../lib/news-numerics-v7.mjs';
function fixture(gap){
 const sessions=Array.from({length:610},(_,i)=>new Date(Date.UTC(2024,0,1+i)).toISOString().slice(0,10));
 let p=100;const prices=sessions.slice(0,601).map((date,i)=>({date,close:p*=Math.exp(.0005+.008*Math.sin(i*.7))})).filter((r,i)=>i!==gap);
 return {asset:{code:'synthetic',prices},input:{origin:sessions[590],calendar:{sessions}},origin:sessions[600],targets:sessions.slice(600)};
}
test('historical folds exclude discontinuous prior60 even if their future20 is continuous',()=>{
 const {asset,input,origin,targets}=fixture(450),out=fitConditionalPath(asset,input,origin,targets);
 assert.equal(out.status,'RESEARCH_ESTIMATE');assert.equal(out.validation.folds,3);
 const tr=training(asset,origin,input.calendar.sessions).returns;
 for(const m of out.models)for(const f of m.folds){const last=tr.filter(r=>r.date<=f.origin).slice(-60);assert.equal(last.length,60);last.forEach((r,j)=>assert.equal(r.index,last.at(-1).index-59+j));}
 assert.ok(out.validation.candidates.every(c=>c.rejections.length>=3));
});
test('continuous training retains all six historical folds',()=>{
 const {asset,input,origin,targets}=fixture(-1),out=fitConditionalPath(asset,input,origin,targets);
 assert.equal(out.validation.folds,6);
});
test('one-step quantiles preserve representable final prices despite exp intermediary range',()=>{
 for(const [start,r] of [[1e-300,710],[1e300,-750]]){
 const out=exactOneStepDistribution(start,[r]),expected=Math.exp(Math.log(start)+r);
 assert.equal(out.p10,expected);assert.equal(out.p50,expected);assert.equal(out.p90,expected);
 assert.equal(out.p50,exactPriceMoments(start,[{date:'2026-09-28',values:[r]}]).rows[1].mean);
 }
});
test('genuinely unrepresentable final prices still fail and ordinary outputs stay unchanged',()=>{
 assert.throws(()=>exactOneStepDistribution(1,[1000]),/range limit/);
 assert.throws(()=>exactOneStepDistribution(1,[-1000]),/range limit/);
 assert.equal(exactOneStepDistribution(100,[.01]).p50,100*Math.exp(.01));
});

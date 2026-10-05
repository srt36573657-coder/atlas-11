import test from 'node:test';
import assert from 'node:assert/strict';
import { exactOneStepDistribution, monteCarloPrecision } from '../lib/news-numerics-v7.mjs';

const near = (a,b) => assert.ok(Math.abs(a-b)<1e-12, `${a} != ${b}`);
test('one-step weighted marginal preserves atoms, zero mass, tails and strict up threshold',()=>{
  const r=exactOneStepDistribution(100,[Math.log(.5),0,Math.log(2),1000],{weights:[2,5,3,0]});
  assert.deepEqual([r.p10,r.p50,r.p90],[50,100,200]); near(r.probUp,.3);
  assert.equal(r.monteCarloError,0);assert.equal(r.trustProbability,null);
  const constant=exactOneStepDistribution(100,[0,0,0]);
  assert.deepEqual([constant.p10,constant.p50,constant.p90,constant.probUp],[100,100,100,0]);
  assert.throws(()=>exactOneStepDistribution(100,[1000]));
  assert.throws(()=>exactOneStepDistribution(100,[0],{weights:[0]}));
});
test('DKW bounds retain uncertainty at zero/all positives and expose unbounded tails',()=>{
  const none=monteCarloPrecision(Array(20000).fill(100),{positiveCount:0,familySize:1196});
  assert.equal(none.singleDistribution.probability[0],0);
  assert.ok(none.singleDistribution.probability[1]>0);
  assert.ok(none.wholeForecast.cdfErrorBound>none.singleDistribution.cdfErrorBound);
  assert.equal(none.trustProbability,null);
  const all=monteCarloPrecision([100],{positiveCount:1});
  assert.ok(all.singleDistribution.probability[0]<1);
  assert.equal(all.singleDistribution.p90.upper,null);
  assert.equal(all.singleDistribution.p90.upperUnbounded,true);
  assert.equal(all.singleDistribution.p10.lower,0);
  assert.doesNotThrow(()=>JSON.stringify(all));
  assert.throws(()=>monteCarloPrecision([2,1],{positiveCount:0}));
  assert.throws(()=>monteCarloPrecision([1],{positiveCount:2}));
  assert.throws(()=>monteCarloPrecision([1],{positiveCount:0,familySize:0}));
});
test('fixed-size 95% DKW coverage checked by exact binomial enumeration, including discrete quantiles',()=>{
  const n=20;
  const choose=(n,k)=>{let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return v;};
  for(const p of [.01,.1,.3,.5,.7,.9,.99]){
    let jointCoverage=0;
    for(let k=0;k<=n;k++){
      const sample=[...Array(n-k).fill(50),...Array(k).fill(150)];
      const b=monteCarloPrecision(sample,{positiveCount:k}).singleDistribution;
      const mass=choose(n,k)*p**k*(1-p)**(n-k);
      const covers=p>=b.probability[0]&&p<=b.probability[1]&&[.1,.5,.9].every(q=>{
        const actual=q<=1-p?50:150, band=b['p'+Math.round(q*100)];
        return actual>=band.lower&&(band.upper===null||actual<=band.upper);
      });
      if(covers)jointCoverage+=mass;
    }
    assert.ok(jointCoverage>=.95-1e-12,`${p}: ${jointCoverage}`);
  }
});
test('doubling fixed paths reduces the CDF error budget by sqrt(2)',()=>{
  const a=monteCarloPrecision(Array(10000).fill(100),{positiveCount:5000});
  const b=monteCarloPrecision(Array(20000).fill(100),{positiveCount:10000});
  near(a.singleDistribution.cdfErrorBound/b.singleDistribution.cdfErrorBound,Math.sqrt(2));
});

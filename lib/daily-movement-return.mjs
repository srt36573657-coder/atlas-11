// Daily movement research: 1/2-session response plus 5/20/60 windows.
// Archived v8 conditional mean: own-stock price history, pre-period chronological selection.
// No generated news, externally chosen slopes, or clipping of observed returns.
import {training, mean, hashString} from './engine.mjs';

export const CONDITIONAL_POLICY = Object.freeze({
  id:'own-daily-lags-ridge-1', featureWindows:[1,2,5,20,60],
  maxTrainingRows:504, minimumTrainingRows:126, foldDays:20, folds:6,
  ridgePenalties:[0.1,1,10], interceptPrior:252,
  candidates:['zero','shrunk-mean','ridge-0.1','ridge-1','ridge-10'],
  horizons:[1,5,20], weighting:'exp_negative_relative_validation_loss',
  stability:'reject_AR_absolute_weight_sum_at_least_one',
  selectionBeforeFixedPeriod:true, trustProbability:null,
});
const features=history=>history.length<60?null:CONDITIONAL_POLICY.featureWindows.map(n=>mean(history.slice(-n)));
function solve(A,b){
  const rows=A.map((r,i)=>[...r,b[i]]), n=b.length;
  for(let j=0;j<n;j++){
    let p=j;for(let i=j+1;i<n;i++)if(Math.abs(rows[i][j])>Math.abs(rows[p][j]))p=i;
    if(Math.abs(rows[p][j])<1e-18)return null;
    [rows[j],rows[p]]=[rows[p],rows[j]];
    const d=rows[j][j];for(let k=j;k<=n;k++)rows[j][k]/=d;
    for(let i=0;i<n;i++)if(i!==j){const c=rows[i][j];for(let k=j;k<=n;k++)rows[i][k]-=c*rows[j][k];}
  }
  return rows.map(r=>r[n]);
}
function examples(rows){
  const out=[];
  for(let j=60;j<rows.length;j++){
    const before=rows.slice(j-60,j);
    if(before.some((r,k)=>r.index!==rows[j].index-60+k))continue;
    out.push({x:features(before.map(r=>r.value)),y:rows[j].value,date:rows[j].date});
  }
  return out.slice(-CONDITIONAL_POLICY.maxTrainingRows);
}
function fit(rows,id){
  const ds=examples(rows);
  if(ds.length<CONDITIONAL_POLICY.minimumTrainingRows)return null;
  if(id==='zero')return{id,intercept:0,coefficients:CONDITIONAL_POLICY.featureWindows.map(()=>0),n:ds.length};
  const intercept=ds.reduce((s,r)=>s+r.y,0)/(ds.length+CONDITIONAL_POLICY.interceptPrior);
  if(id==='shrunk-mean')return{id,intercept,coefficients:CONDITIONAL_POLICY.featureWindows.map(()=>0),n:ds.length};
  const lambda=Number(id.slice(6));
  const scales=CONDITIONAL_POLICY.featureWindows.map((_,j)=>j).map(j=>Math.sqrt(mean(ds.map(r=>r.x[j]**2)))||1);
  const X=ds.map(r=>r.x.map((x,j)=>x/scales[j]));
  const A=CONDITIONAL_POLICY.featureWindows.map((_,j)=>j).map(j=>CONDITIONAL_POLICY.featureWindows.map((_,j)=>j).map(k=>X.reduce((s,x)=>s+x[j]*x[k],0)+(j===k?lambda*ds.length:0)));
  const b=CONDITIONAL_POLICY.featureWindows.map((_,j)=>j).map(j=>X.reduce((s,x,k)=>s+x[j]*(ds[k].y-intercept),0));
  const beta=solve(A,b)?.map((x,j)=>x/scales[j]);
  if(!beta||beta.some(x=>!Number.isFinite(x))||beta.reduce((s,x)=>s+Math.abs(x),0)>=1)return null;
  return{id,intercept,coefficients:beta,n:ds.length,lambda};
}
function rollout(model,history,days){
  const data=[...history], path=[];
  for(let h=0;h<days;h++){
    const x=features(data);if(!x)return null;
    const components=x.map((v,j)=>v*model.coefficients[j]);
    const value=model.intercept+components.reduce((s,v)=>s+v,0);
    if(!Number.isFinite(value))return null;
    path.push({value,features:x,components,intercept:model.intercept});data.push(value);
  }
  return path;
}

export function fitConditionalPath(asset,input,origin,targets){
  const data=training(asset,origin,input.calendar.sessions),rows=data.returns;
  const selectionRows=rows.filter(r=>r.date<input.origin);
  const trainedThrough=selectionRows.at(-1)?.date??null;
  const unavailable=reason=>({policy:CONDITIONAL_POLICY.id,status:'UNAVAILABLE',reason,trainedThrough,
    trustProbability:null,rows:targets.map(date=>({date,meanLogReturn:null,status:'UNAVAILABLE'})),validation:null});
  if(selectionRows.length<60+CONDITIONAL_POLICY.minimumTrainingRows+CONDITIONAL_POLICY.foldDays)
    return unavailable('기간 시작 전 연속 가격 학습 표본 부족');
  const last60=rows.slice(-60),originIndex=input.calendar.sessions.indexOf(origin);
  if(last60.length!==60||last60.some((r,j)=>r.index!==originIndex-59+j))return unavailable('출발일 직전 60거래일 연속 가격 부족');
  const candidateFits=CONDITIONAL_POLICY.candidates.map(id=>({id,folds:[],rejections:[]}));
  const ends=Array.from({length:CONDITIONAL_POLICY.folds},(_,j)=>selectionRows.length-(CONDITIONAL_POLICY.folds-j)*CONDITIONAL_POLICY.foldDays)
    .filter(n=>n>=60+CONDITIONAL_POLICY.minimumTrainingRows);
  for(const end of ends){
    const past=selectionRows.slice(0,end),future=selectionRows.slice(end,end+20);
    if(future.length!==20||future.some((r,j)=>r.index!==past.at(-1).index+j+1))continue;
    // Historical validation must obey the same 60-session feature contract as deployment.
    const foldHistory=past.slice(-60),foldOriginIndex=past.at(-1).index;
    if(foldHistory.length!==60||foldHistory.some((r,j)=>r.index!==foldOriginIndex-59+j)){
      for(const candidate of candidateFits)candidate.rejections.push(past.at(-1).date);
      continue;
    }
    for(const candidate of candidateFits){
      const m=fit(past,candidate.id),p=m?rollout(m,past.map(r=>r.value),20):null;
      if(!p){candidate.rejections.push(past.at(-1).date);continue;}
      const losses=CONDITIONAL_POLICY.horizons.map(h=>Math.abs(
        future.slice(0,h).reduce((s,r)=>s+r.value,0)-p.slice(0,h).reduce((s,r)=>s+r.value,0))/Math.sqrt(h));
      candidate.folds.push({origin:past.at(-1).date,targetEnd:future.at(-1).date,loss:mean(losses)});
    }
  }
  const total=candidateFits[0].folds.length;
  if(total<3)return unavailable('기간 시작 전 시간순 검증 구간 3개 미만');
  const valid=candidateFits.filter(c=>c.folds.length===total&&fit(selectionRows,c.id));
  const scale=Math.max(mean(candidateFits[0].folds.map(f=>f.loss)),1e-12);
  const min=Math.min(...valid.map(c=>mean(c.folds.map(f=>f.loss))));
  const weights=valid.map(c=>Math.exp(-(mean(c.folds.map(f=>f.loss))-min)/scale));
  const den=weights.reduce((s,w)=>s+w,0);
  const models=valid.map((c,j)=>({...fit(selectionRows,c.id),weight:weights[j]/den,
    validationLoss:mean(c.folds.map(f=>f.loss)),folds:c.folds}));
  // Freeze coefficients and selection before 9/17. New observed prices update features only.
  const history=rows.map(r=>r.value),output=[{date:origin,meanLogReturn:0,anchor:true,components:[]}];
  for(let h=1;h<targets.length;h++){
    const x=features(history);
    const parts=models.map(m=>({id:m.id,weight:m.weight,intercept:m.intercept,
      featureContributions:x.map((v,j)=>v*m.coefficients[j]),
      value:m.intercept+x.reduce((s,v,j)=>s+v*m.coefficients[j],0)}));
    const mu=parts.reduce((s,m)=>s+m.weight*m.value,0);
    if(!Number.isFinite(mu))return unavailable('조건부 수익률 수치 범위 오류');
    output.push({date:targets[h],meanLogReturn:mu,features:x,components:parts,status:'RESEARCH_ESTIMATE'});
    history.push(mu);
  }
  return{policy:CONDITIONAL_POLICY.id,status:'RESEARCH_ESTIMATE',trainedThrough,
    featureAsOf:origin,featureWindows:CONDITIONAL_POLICY.featureWindows,
    inputDigest:hashString(JSON.stringify({code:asset.code,rows:rows.map(r=>[r.date,r.value]),policy:CONDITIONAL_POLICY})),
    models,rows:output,trustProbability:null,
    validation:{kind:'internal_pre_period_selection_not_independent_accuracy',folds:total,baselineLoss:scale,
      candidates:candidateFits.map(c=>({id:c.id,loss:c.folds.length===total?mean(c.folds.map(f=>f.loss)):null,rejections:c.rejections})),
      prospectiveValidated:false},
    missingInputs:['수급 원자료','공식 장기 지수·업종 자료','발표 직전 예상과 실제 결과'],
    priceBasis:'NAVER_single_source_corporate_actions_unverified'};
}

// Small, per-company ridge residual candidate. No automatic promotion.
import {FOMO_V2,VECTOR} from './fomo-v2.mjs';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function solve(A,b){A=A.map((r,i)=>[...r,b[i]]);for(let k=0;k<b.length;k++){let p=k;for(let i=k+1;i<b.length;i++)if(Math.abs(A[i][k])>Math.abs(A[p][k]))p=i;[A[k],A[p]]=[A[p],A[k]];if(Math.abs(A[k][k])<1e-12)throw Error('Singular design');const v=A[k][k];A[k]=A[k].map(x=>x/v);for(let i=0;i<b.length;i++)if(i!==k){const f=A[i][k];A[i]=A[i].map((x,j)=>x-f*A[k][j]);}}return A.map(r=>r.at(-1));}
export function fitResidual(rows,{lambda=5}={}){
 if(!rows.length||!finite(lambda)||lambda<=0)throw Error('Training rows and positive lambda required');
 const n=VECTOR.length+1,A=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?lambda:0)),b=Array(n).fill(0);
 for(const r of rows){if(!Array.isArray(r.vector)||r.vector.length!==VECTOR.length||!r.vector.every(finite)||!finite(r.actualLogReturn)||!finite(r.baseLogReturn))throw Error('Invalid training row');const x=[1,...r.vector],y=r.actualLogReturn-r.baseLogReturn;for(let i=0;i<n;i++){b[i]+=x[i]*y;for(let j=0;j<n;j++)A[i][j]+=x[i]*x[j];}}
 return solve(A,b);
}
export function predictResidual(coefficients,vector){if(coefficients.length!==VECTOR.length+1||vector.length!==VECTOR.length||![...coefficients,...vector].every(finite))throw Error('Invalid prediction');const v=coefficients.reduce((s,c,i)=>s+c*(i?vector[i-1]:1),0);if(!finite(v))throw Error('Prediction overflow');return v;}
export function walkForward(rows,{code,cutoff='2026-09-16',minimumTrain=30,minimumTest=10,lambda=5,horizon=10}={}){
 if(!/^\d{6}$/.test(code)||!Number.isInteger(horizon)||horizon<1||!Number.isInteger(minimumTrain)||minimumTrain<30||!Number.isInteger(minimumTest)||minimumTest<10)throw Error('Invalid protocol');
 const seen=new Set();const eligible=rows.filter(r=>r.code===code&&r.horizon===horizon&&r.featureVersion===FOMO_V2&&r.targetDate>r.date&&r.targetDate<=cutoff&&r.pointInTimeVerified===true&&r.adjustmentsVerified===true&&r.vector?.length===VECTOR.length&&r.vector.every(finite)&&finite(r.actualLogReturn)&&finite(r.baseLogReturn)&&Number.isFinite(Date.parse(r.observedAt))&&Number.isFinite(Date.parse(r.issuedAt))&&Date.parse(r.observedAt)<=Date.parse(r.issuedAt)&&r.issuedAt.slice(0,10)===r.date&&r.date<r.targetDate).sort((a,b)=>a.date.localeCompare(b.date));
 for(const r of eligible){if(seen.has(r.date))throw Error('Conflicting duplicate training date');seen.add(r.date);}
 const nonoverlap=[];for(const r of eligible)if(!nonoverlap.length||r.date>nonoverlap.at(-1).targetDate)nonoverlap.push(r);
 const tests=[];for(let i=minimumTrain;i<nonoverlap.length;i++){const test=nonoverlap[i],train=nonoverlap.slice(0,i).filter(r=>r.targetDate<test.date);if(train.length<minimumTrain)continue;const c=fitResidual(train,{lambda}),delta=predictResidual(c,test.vector),predicted=test.baseLogReturn+delta;tests.push({date:test.date,targetDate:test.targetDate,trainDates:train.length,lastTrainingTarget:train.at(-1).targetDate,delta,predicted,actual:test.actualLogReturn,base:test.baseLogReturn,baseError:Math.abs(test.baseLogReturn-test.actualLogReturn),candidateError:Math.abs(predicted-test.actualLogReturn)});}
 return{version:FOMO_V2,code,horizon,cutoff,lambda,eligible:eligible.length,independentWindows:nonoverlap.length,tests,status:tests.length>=minimumTest?'retrospective_research_only':'insufficient_evidence',baseMAE:tests.length?mean(tests.map(t=>t.baseError)):null,candidateMAE:tests.length?mean(tests.map(t=>t.candidateError)):null,coefficients:tests.length>=minimumTest?fitResidual(nonoverlap,{lambda}):null,forecastIntegration:{enabled:false,trustProbability:null,reason:'향후 독립 검증·일별 경로 검증·승격 기준 미충족'},protocol:{minimumTrain,minimumTest,lambdaSelection:'fixed_before_test',purge:'target_before_test_start',unit:'nonoverlapping_dates',tier:'core-6+maGap',prospective:false}};
}

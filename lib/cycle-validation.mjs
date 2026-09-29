import {validDay} from './cycle-data.mjs';
import {CYCLE_PROTOCOL as P} from './cycle-protocol.mjs';
import {mean,variance,quantile,random,sha256} from './cycle-math.mjs';
// Date clusters are shared across all comparisons. Overlapping horizons are not
// independent trials. A one-sided centered max statistic controls this declared family.
export function pairedCycleAudit(rows,{draws=P.bootstrapDraws,seed=P.seed,blockOrigins=2,horizon=P.primaryHorizon}={}){
 const candidates=rows.filter(r=>r.horizon===horizon&&validDay(r.date)&&validDay(r.targetDate)&&r.targetDate>r.date&&[r.lossCandidate,r.lossBase,r.lossNaive].every(v=>Number.isFinite(v)&&v>=0));
 // Audit eligibility is checked here, even when the caller already screened rows.
 // Identical copies are harmless; conflicting vintages/fits must be resolved upstream.
 const unique=new Map(),conflicts=new Set();
 const signature=r=>JSON.stringify([r.targetDate,r.lossCandidate,r.lossBase,r.lossNaive,r.lossMarketOnly??null,r.fitHash??null,r.trainedThrough??null,r.baselineId??null]);
 for(const row of candidates){
  const key=JSON.stringify([row.code,row.date,row.horizon]),prior=unique.get(key);
  if(prior&&signature(prior)!==signature(row))conflicts.add(key);
  else if(!prior)unique.set(key,row);
 }
 const selected=[...unique.values()],dates=[...new Set(selected.map(r=>r.date))].sort();
 const marketComparison=selected.length>0&&selected.every(r=>Number.isFinite(r.lossMarketOnly)&&r.lossMarketOnly>=0);
 const keys=[...new Set(selected.map(r=>r.code))].sort().flatMap(code=>[code+':base',code+':naive',...(marketComparison?[code+':marketOnly']:[])]);
 const common=dates.filter(date=>keys.every(key=>selected.some(r=>r.date===date&&r.code===key.split(':')[0])));
 const out={status:'insufficient_evidence',enabled:false,trustProbability:null,draws,seed,horizon,blockOrigins,independentCrossValidationCount:null,dateClusters:common.length,comparisons:[],protocolHash:sha256(P),method:'paired_date_block_centered_max_statistic'};
 if(conflicts.size)return {...out,reason:'상충하는 동일 종목·출발일·목표기간 감사 행',inputErrors:[{code:'CONFLICTING_DUPLICATE',keys:[...conflicts].sort()}]};
 // Price returns cover (origin, target]; a shared boundary is not overlap.
 let previousEnd=null;
 for(const date of common){
  const end=selected.filter(r=>r.date===date).map(r=>r.targetDate).sort().at(-1);
  if(previousEnd!==null&&date<previousEnd)return {...out,reason:'감사 평가 구간 중첩: 비중복 표본 자격 미충족',inputErrors:[{code:'OVERLAPPING_TARGET_WINDOWS',origin:date,previousTarget:previousEnd}]};
  previousEnd=end;
 }
 if(common.length<P.minimumNonoverlapTestOrigins)return out;
 const matrix=common.map(date=>keys.map(key=>{const [code,base]=key.split(':');const row=selected.find(r=>r.date===date&&r.code===code);return row.lossCandidate-(base==='base'?row.lossBase:base==='marketOnly'?row.lossMarketOnly:row.lossNaive);}));
 const means=keys.map((_,j)=>mean(matrix.map(row=>row[j]))),ses=keys.map((_,j)=>Math.sqrt(variance(matrix.map(row=>row[j]))/common.length));
 const rnd=random(seed),maxima=[];
 for(let b=0;b<draws;b++){
  const ids=[];while(ids.length<common.length){const start=Math.floor(rnd()*common.length);for(let j=0;j<blockOrigins&&ids.length<common.length;j++)ids.push((start+j)%common.length);}
  maxima.push(Math.max(...keys.map((_,j)=>ses[j]>1e-14?(mean(ids.map(i=>matrix[i][j]))-means[j])/ses[j]:0)));
 }
 const critical=Math.max(0,quantile(maxima,.95));
 out.status='retrospective_research_only';out.critical=critical;
 out.comparisons=keys.map((key,j)=>({key,meanDifference:means[j],upper95:means[j]+critical*ses[j],passesHistoricalPointCheck:ses[j]>1e-14&&means[j]+critical*ses[j]<0}));
 out.reason='학습·시험 구간 수를 재표집 횟수와 구분. 분포·향후 성과 미검증으로 운영 사용 불가.';
 return out;
}

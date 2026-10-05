import {sha256,stableJSON} from './cycle-math.mjs';
import {assertCycleUniverse,CYCLE_PROTOCOL} from './cycle-protocol.mjs';
export function validDay(x){if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;const t=Date.parse(x+'T00:00:00Z');return Number.isFinite(t)&&new Date(t).toISOString().slice(0,10)===x;}
export function validTime(x){return typeof x==='string'&&/T.*(?:Z|[+-]\d\d:\d\d)$/.test(x)&&Number.isFinite(Date.parse(x));}
export function https(x){try{return new URL(x).protocol==='https:';}catch{return false;}}
export function officialURL(x){try{const u=new URL(x);return u.protocol==='https:'&&(u.hostname==='krx.co.kr'||u.hostname.endsWith('.krx.co.kr'));}catch{return false;}}
export function emptyCycleData(input){
 assertCycleUniverse(input);
 return {schema:'atlas-cycle-data-1',universe:input.assets.map(a=>a.code).sort(),origin:input.origin,end:input.end,
 calendar:null,series:[],mappings:[],trainingRows:[],revisions:[],imports:[]};
}
function evidence(r,now,{date}={}){
 if(!https(r.sourceUrl))throw Error('주기 자료의 HTTPS 원문 출처가 필요합니다.');
 if(!validTime(r.observedAt)||Date.parse(r.observedAt)>Date.parse(now))throw Error('관측 시각을 확인하세요.');
 const verified=r.vintageVerified===true&&https(r.archiveUrl)&&validTime(r.availableAt);
 const knownAt=verified?r.availableAt:now;
 if(Date.parse(knownAt)>Date.parse(now)||(date&&Date.parse(knownAt)<Date.parse(date+'T15:30:00+09:00')))throw Error('가격의 공개 시각·관측 날짜가 맞지 않습니다.');
 return {...r,observedAt:r.observedAt,recordedAt:now,knownAt,vintageVerified:verified,verificationMeaning:'uploader_attestation_not_independent_certification'};
}
function cleanRecord(r){const x={...r};for(const k of ['knownAt','recordedAt','observedAt','verificationMeaning'])delete x[k];return x;}
export function mergeCycleData(existing,payload,input,{now=new Date().toISOString()}={}){
 assertCycleUniverse(input);
 if(!validTime(now)||payload?.schema!=='atlas-cycle-input-1')throw Error('atlas-cycle-input-1 형식이 필요합니다.');
 if(payload.origin&&payload.origin!==input.origin||payload.end&&payload.end!==input.end)throw Error('예측 기간 변경 불가');
 const store=structuredClone(existing??emptyCycleData(input));
 if(stableJSON(store.universe)!==stableJSON(input.assets.map(a=>a.code).sort()))throw Error('52종목 코드 불일치');
 const changes=[],seen=new Set(),patches=payload.replacements??[];
 const upsert=(entity,key,rows,incoming,keyOf)=>{
  const token=entity+':'+key;if(seen.has(token))throw Error('입력의 중복 자료: '+token);seen.add(token);
  const index=rows.findIndex(r=>keyOf(r)===key),before=index<0?null:rows[index];
  if(before&&stableJSON(cleanRecord(before))===stableJSON(cleanRecord(incoming)))return;
  if(before){
   const patch=patches.find(p=>p.entity===entity&&p.key===key);
   if(!patch||patch.expectedHash!==sha256(before)||typeof patch.reason!=='string'||!patch.reason.trim())throw Error('기존 주기 자료와 충돌: '+token+' · 원본 해시와 수정 이유 필요');
   incoming.knownAt=now;
  }
  const change={entity,key,before:structuredClone(before),after:structuredClone(incoming),at:now,reason:patches.find(p=>p.entity===entity&&p.key===key)?.reason??'new_observation'};
  if(index<0)rows.push(incoming);else rows[index]=incoming;changes.push(change);
 };
 if(payload.calendar){
  const c=payload.calendar;if(!Array.isArray(c.sessions)||!c.sessions.length||c.sessions.some(d=>!validDay(d))||new Set(c.sessions).size!==c.sessions.length)throw Error('검증된 거래일 목록 필요');
  if(!officialURL(c.sourceUrl))throw Error('거래일 원천은 KRX 공식 출처가 필요합니다.');
  const value=evidence({...c,sessions:[...c.sessions].sort()},now),list=store.calendar?[store.calendar]:[];
  upsert('calendar','KRX',list,value,()=> 'KRX');store.calendar=list[0];
 }
 let total=0;
 for(const raw of payload.series??[]){
  if(!/^[A-Za-z0-9:_-]{1,90}$/.test(raw.id)||!['market','sector','stock'].includes(raw.kind)||!['KOSPI','KOSDAQ','KRX'].includes(raw.market)||raw.currency!=='KRW'||raw.basis!=='PR'||!raw.methodId||!validDay(raw.launchDate))throw Error('지수 ID·시장·가격지수 기준·방법·출시일 필요');
  if(raw.kind==='stock'&&!store.universe.includes(raw.stockCode))throw Error('대상 밖 종목 가격');
  if(!officialURL(raw.sourceUrl))throw Error('주기 지수는 KRX 공식 원천이 필요합니다.');
  if(!Array.isArray(raw.rows)||(total+=raw.rows.length)>300000)throw Error('주기 가격 행 한도 초과');
  const meta=evidence(Object.fromEntries(Object.entries(raw).filter(([k])=>k!=='rows')),now);
  const old=store.series.find(s=>s.id===raw.id),oldMeta=old?Object.fromEntries(Object.entries(old).filter(([k])=>k!=='rows')):null;
  if(oldMeta&&['kind','market','currency','basis','methodId','launchDate','stockCode'].some(k=>oldMeta[k]!==meta[k]))throw Error('지수 산출 기준 변경은 새 series ID와 적용 기간으로 입력하세요.');
  const metaList=oldMeta?[oldMeta]:[];
  upsert('series',raw.id,metaList,meta,r=>r.id);
  const series={...metaList[0],rows:old?.rows??[]};
  if(old)store.series[store.series.indexOf(old)]=series;else store.series.push(series);
  for(const row of raw.rows){
   if(!validDay(row.date)||typeof row.close!=='number'||!Number.isFinite(row.close)||row.close<=0||!store.calendar?.sessions.includes(row.date))throw Error('유효 종가·공식 거래일 필요: '+raw.id);
   const v=evidence({...row,backcast:row.date<raw.launchDate,vintageVerified:row.date<raw.launchDate?false:row.vintageVerified,sourceUrl:row.sourceUrl??raw.sourceUrl,observedAt:row.observedAt??raw.observedAt},now,{date:row.date});
   upsert('row:'+raw.id,row.date,series.rows,v,r=>r.date);
  }
  series.rows.sort((a,b)=>a.date.localeCompare(b.date));
 }
 for(const row of payload.mappings??[]){
  if(!store.universe.includes(row.code)||!row.id||!validDay(row.effectiveFrom)||(row.effectiveTo!=null&&(!validDay(row.effectiveTo)||row.effectiveTo<row.effectiveFrom))||!['exact','broad_proxy'].includes(row.mappingType))throw Error('종목·유효기간·업종 대응 수준 오류');
  if(!officialURL(row.sourceUrl)||!row.marketIndexId||!row.sectorIndexId)throw Error('공식 시장·업종 대응 근거 필요');
  upsert('mapping',row.id,store.mappings,evidence(row,now),r=>r.id);
 }
 for(const row of payload.trainingRows??[]){
  if(!row.id||!store.universe.includes(row.code)||!validDay(row.date)||!validDay(row.targetDate)||row.targetDate<=row.date||!Number.isInteger(row.horizon)||row.horizon<1||!Array.isArray(row.features)||row.features.length!==4||row.features.some(v=>!Number.isFinite(v))||!Number.isFinite(row.baseExpectedLogReturn)||!(row.originPrice>0)||!(row.actualPrice>0))throw Error('주기 학습 행 형식 오류');
  if(!validTime(row.featureAsOf)||Date.parse(row.featureAsOf)>Date.parse(row.date+'T23:59:59+09:00')||!validTime(row.targetPublishedAt)||(Date.parse(row.targetPublishedAt)>Date.parse(now)||Date.parse(row.targetPublishedAt)<Date.parse(row.targetDate+'T15:30:00+09:00')))throw Error('학습 특징·실제 결과 시각 오류');
  if(row.vintageVerified===true&&(!validTime(row.availableAt)||Date.parse(row.availableAt)<Date.parse(row.targetPublishedAt)))throw Error('실제 결과 공개 전 학습 자료로 기록할 수 없습니다.');
  if(!store.calendar||store.calendar.sessions.filter(d=>d>row.date&&d<=row.targetDate).length!==row.horizon)throw Error('학습 목표 거래일 수 오류');
  upsert('training',row.id,store.trainingRows,evidence({...row,calendarVerified:true},now),r=>r.id);
 }
 if(!changes.length)return store;
 store.revisions.push(...changes);store.imports.push({at:now,inputHash:sha256(payload),changes:changes.length});
 return store;
}
export function cycleSnapshot(store,cutoff,{strict=true}={}){
 if(!validTime(cutoff))throw Error('주기 정보 기준 시각 필요');
 const next=structuredClone(store);
 for(const r of [...(store.revisions??[])].reverse()){
  if(Date.parse(r.at)<=Date.parse(cutoff))continue;
  // Initial archived records may be attested as available earlier. Revisions never are.
  if(!r.before&&Date.parse(r.after?.knownAt)<=Date.parse(cutoff))continue;
  const apply=(rows,keyOf)=>{const i=rows.findIndex(x=>keyOf(x)===r.key);if(i>=0)rows.splice(i,1);if(r.before)rows.push(structuredClone(r.before));};
  if(r.entity==='calendar')next.calendar=structuredClone(r.before);
  else if(r.entity==='series'){
   const rows=next.series.find(s=>s.id===r.key)?.rows??[];
   apply(next.series,x=>x.id);const restored=next.series.find(s=>s.id===r.key);if(restored)restored.rows=rows;
  }else if(r.entity.startsWith('row:')){const s=next.series.find(x=>x.id===r.entity.slice(4));if(s)apply(s.rows,x=>x.date);}
  else if(r.entity==='mapping')apply(next.mappings,x=>x.id);
  else if(r.entity==='training')apply(next.trainingRows,x=>x.id);
 }
 const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date(cutoff));
 const known=r=>Date.parse(r.knownAt)<=Date.parse(cutoff);
 next.series=next.series.filter(s=>known(s)).map(s=>({...s,rows:s.rows.filter(r=>r.date<=day&&known(r)&&(!strict||r.vintageVerified)).sort((a,b)=>a.date.localeCompare(b.date))}));
 next.mappings=next.mappings.filter(known);next.trainingRows=next.trainingRows.filter(known);
 if(next.calendar&&!known(next.calendar))next.calendar=null;
 return next;
}
export function resolveCycleMapping(snapshot,code,date){
 const list=snapshot.mappings.filter(m=>m.code===code&&m.effectiveFrom<=date&&(!m.effectiveTo||m.effectiveTo>=date));
 if(list.length!==1)return {status:'abstain',reason:list.length?'겹치는 업종 대응 근거':'공식 업종 대응 미확보'};
 const mapping=list[0],market=snapshot.series.find(s=>s.id===mapping.marketIndexId),sector=snapshot.series.find(s=>s.id===mapping.sectorIndexId);
 if(!market||!sector)return {status:'abstain',reason:'시장·업종 지수 원자료 미확보',mapping};
 if(market.kind!=='market'||sector.kind!=='sector'||market.market!==sector.market||market.basis!==sector.basis||market.currency!==sector.currency)return {status:'abstain',reason:'시장·업종 지수 기준 불일치',mapping};
 return {status:'ready',mapping,market,sector};
}

// One routing contract for ingestion, estimation, UI and version hashes.
export const MACRO_KINDS = new Set(['FOMC','BOK','CPI','PPI','JOBS','JOLTS']);
export function scopeOf(e) {
  if(e.scope) return e.scope;
  if(e.target==='all' && MACRO_KINDS.has(e.kind)) return {type:'market'};
  if(e.target!=='all' && Array.isArray(e.codes) && e.codes.length) return {type:'company',codes:e.codes};
  return {type:'unknown'};
}
export function normalizeEvent(e) {
  const scope=structuredClone(scopeOf(e));
  return {...e,scope,target:scope.type==='market'?'all':scope.type,codes:scope.codes??[]};
}
const https=url=>{try{return new URL(url).protocol==='https:';}catch{return false;}};
export function scopeErrors(e, assets, cutoff) {
  const s=scopeOf(e), errors=[];
  if(s.type==='market') {
    if(!MACRO_KINDS.has(e.kind))errors.push('시장 공통으로 승인된 경제 발표 종류가 아님');
    if(s.codes?.length||s.sectors?.length)errors.push('시장 공통 범위에 개별 대상을 혼합할 수 없음');
  } else if(s.type==='company'||s.type==='index') {
    if(!Array.isArray(s.codes)||!s.codes.length||s.codes.some(c=>!assets.some(a=>a.code===c)))errors.push('대상 종목 코드 누락/오류');
    if(s.type==='index') {
      const m=s.membership;
      if(!s.name||!https(m?.url)||!Number.isFinite(Date.parse(m?.availableAt))||Date.parse(m.availableAt)>Date.parse(cutoff)||!/^\d{4}-\d{2}-\d{2}$/.test(m?.effectiveFrom??"")||m.effectiveFrom>e.targetDate||(m.effectiveTo&&(!/^\d{4}-\d{2}-\d{2}$/.test(m.effectiveTo)||m.effectiveTo<e.targetDate)))errors.push('지수 구성 대상의 출처·공개 시각·적용 기간 오류');
    }
  } else if(s.type==='sector') {
    if(!Array.isArray(s.sectors)||!s.sectors.length||s.sectors.some(v=>!assets.some(a=>a.sector===v)))errors.push('업종 분류 누락/불일치');
  } else errors.push('뉴스 범위 미지정: 시장·지수·업종·기업 중 선택 필요');
  return errors;
}
export function appliesTo(e,a) {
  const s=scopeOf(e);
  return s.type==='market'?MACRO_KINDS.has(e.kind):s.type==='sector'?!!s.sectors?.includes(a.sector):['index','company'].includes(s.type)?!!s.codes?.includes(a.code):false;
}
export function sameFamily(a,b) {
  const x=scopeOf(a),y=scopeOf(b);
  return a.kind===b.kind&&x.type===y.type&&(x.type!=='index'||x.name===y.name);
}
export function scopeLabel(e) {
  const s=scopeOf(e);
  return s.type==='market'?'시장 공통':s.type==='index'?`지수 · ${s.name}`:s.type==='sector'?`업종 · ${s.sectors?.join(', ')}`:s.type==='company'?'기업 고유':'범위 미확인';
}
export function scopeCounts(events) {
  return Object.fromEntries(['market','index','sector','company'].map(type=>[type,events.filter(e=>scopeOf(e).type===type).length]));
}
// Semantic keys ignore object insertion order and target-list order.
export function stableValue(value) {
  if(Array.isArray(value))return value.map(stableValue);
  if(value && typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stableValue(value[k])]));
  return value;
}
export function scopeKey(e) {
  const s=structuredClone(scopeOf(e));
  for(const k of ['codes','sectors'])if(Array.isArray(s[k]))s[k]=[...new Set(s[k])].sort();
  return JSON.stringify(stableValue(s));
}
export function eventIdentity(e) {
  return JSON.stringify([e.kind,e.announcementDate,e.targetDate,scopeKey(e),e.reference??'',e.name,
    [...new Set((e.sources??[]).map(s=>s.url))].sort()]);
}

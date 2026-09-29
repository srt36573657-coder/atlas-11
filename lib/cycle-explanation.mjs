export function explainCycle(report,code,date,baselineId){
 const row=report?.rows?.find(r=>r.code===code);
 if(!row)return {code,date,status:'abstain',summary:'지수·업종 주기 자료를 확인 중입니다.',reasons:['공식 지수·업종 대응 자료 미확보'],trustProbability:null};
 if(report.baselineId!==baselineId)return {code,date,status:'stale',summary:'선택한 과거 전망에는 이 주기 분석을 소급 적용하지 않습니다.',reasons:['기준 전망이 다른 연구 기록'],trustProbability:null};
 const target=row.candidate?.rows.filter(r=>r.date<=date).at(-1),isPast=date<=report.origin;
 return {code,date,status:row.status,summary:isPast?'이 날짜의 실제 가격은 주기로 보정하지 않습니다.':row.candidate?'기존 뉴스 전망과 별도로 계산한 주기 연구 후보입니다.':'주기 보정 유보 · 기존 뉴스 모형 유지',
  observedThrough:report.origin,market:row.market,sector:row.sector,marketName:row.marketName,sectorName:row.sectorIndexName,
  mappingType:row.mappingType,exposure:row.exposure,reasons:row.reasons,sourceUrls:row.sourceUrls??[],
  target:!isPast?target:null,featureCount:row.exposure&&row.market&&row.sector?4:0,
  applied:false,trustProbability:null,intervalNote:'후보 구간에 보정계수 추정 불확실성은 미포함'};
}

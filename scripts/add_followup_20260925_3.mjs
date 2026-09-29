// Verified additions only. Existing curated records and forecast history are retained.
import fs from 'node:fs';
const path='public/data/researched-news.json';
const s=JSON.parse(fs.readFileSync(path));
if(s.releaseId==='official-news-20260925-3')process.exit(0);
if(s.releaseId!=='official-news-20260925-2')throw Error('이 일회성 갱신보다 최신 자료가 있습니다. 기존 자료를 보존하세요.');
const at=new Date().toISOString(), releaseId='official-news-20260925-3';
const additions=[
 {code:'032830',name:'삼성생명 해외 보험사 투자 검토 재공시 예정',date:'2026-10-02',kind:'COMPANY_REDISCLOSURE',url:'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260903800096',source:'DART 삼성생명 2026.09.03 공시 본문',note:'미국 보험사 지분 투자 검토에 대한 후속 공시 예정일. 구체적 결정 시 더 일찍 공시할 수 있으며, 인수 성사일이 아니다. 검토 결과·주가 방향은 미확정.',basis:'DART 본문을 브라우저에서 직접 확인: 회사명, 2026.09.03 문서, 재공시예정일 2026-10-02. 검색 도구의 원문 열기 오류와 별개로 본문 대조 완료.'},
 {code:'000810',name:'삼성화재 해외 보험사 인수 검토 재공시 예정',date:'2026-10-02',kind:'COMPANY_REDISCLOSURE',url:'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260903800106',source:'DART 삼성화재해상보험 2026.09.03 공시 본문',note:'영국 보험사 인수 검토에 대한 후속 공시 예정일. 구체적 결정 시 더 일찍 공시할 수 있으며, 인수 성사일이 아니다. 검토 결과·주가 방향은 미확정.',basis:'DART 본문을 브라우저에서 직접 확인: 회사명, 2026.09.03 문서, 재공시예정일 2026-10-02. 검색 도구의 원문 열기 오류와 별개로 본문 대조 완료.'},
 {code:'012750',name:'에스원·웅진 클라우드 보안·재해복구 공동 세미나',date:'2026-10-12',kind:'COMPANY_BUSINESS_SEMINAR',url:'https://kr.linkedin.com/posts/woongjin-it_%EC%9B%85%EC%A7%84-%EC%97%90%EC%8A%A4%EC%9B%90-aws-activity-7502615166002483200-__Uv',source:'공동 주최사 WOONGJIN IT 행사 공지',note:'한국시간 14:00~17:00, 서울 중구 케이스퀘어시티 B2. 보안·재해복구 사업 소개 일정. 계약 체결·실적 발표가 아니며 매출 기여와 가격 효과는 확인되지 않았다.',basis:'공동 주최사 게시물 본문에서 에스원 공동 개최, 2026-10-12 14:00~17:00 일시를 확인. 사업 행사 일정과 가격 촉매 입증을 구분.'}
];
for(const a of additions){
 const id=`REVIEW:${a.kind}-${a.code}-${a.date.replaceAll('-','')}`;
 if(!s.events.some(e=>e.id===id))s.events.push({id,name:a.name,kind:a.kind,eventDate:a.date,announcementDate:a.date,targetDate:a.date,scope:{type:'company',codes:[a.code]},availableAt:at,firstObservedAt:at,publishedAt:null,status:'scheduled',sources:[{name:a.source,url:a.url,retrievedAt:at}],channel:a.note+' 비교 표본 부족으로 수치 영향 유보.',reference:'공식 일정 확인 · 결과 미공개 · 가격 효과 미검증',dateBasis:'공식 예정일을 그래프에 표시. 실제 발표·주가 반영 시각을 확정한 것이 아님.',importance:'review',reviewReleaseId:releaseId});
 const row=s.research.assets.find(r=>r.code===a.code);
 Object.assign(row,{note:a.note+' 비교 표본 부족으로 수치 영향 유보.',status:'company_schedule_confirmed',checkedAt:at,researchBasis:a.basis});
 row.sources=[{name:a.source,url:a.url},...row.sources.filter(r=>r.url!==a.url)];
}
const olix=s.research.assets.find(r=>r.code==='226950');
olix.note='10/7 행사 날짜는 주최자 공식 일정 확인, 올릭스 참가 사실은 거래소 발표를 인용한 연합뉴스·뉴스핌 보도 일치. 참가 명단 공식 페이지 접속 오류로 원문 대조 보류. 확정 집계·가격 계산에서 제외.';
olix.checkedAt=at;
const f=s.research.followup25;
f.fullyConfirmedCompanyScheduleCodes=[...new Set([...f.fullyConfirmedCompanyScheduleCodes,...additions.map(r=>r.code)])];
f.unresolvedCodes=f.requestedCodes.filter(c=>!f.fullyConfirmedCompanyScheduleCodes.includes(c));
f.complete=f.unresolvedCodes.length===0;
f.note=`요청한 25종목 중 ${f.fullyConfirmedCompanyScheduleCodes.length}종목 일정 원문 확인, ${f.unresolvedCodes.length}종목 미확인. 에스원 일정은 사업 소개 세미나이며 가격 촉매 입증을 뜻하지 않는다.`;
s.research.batchReview={checkedAt:at,requestedCodes:f.unresolvedCodes.concat(additions.map(r=>r.code)),searchedCount:24,policy:'종목 묶음 검색 후 날짜·종목코드·원문을 대조. 막힌 개별 출처는 보류하고 다른 종목을 조사. 검색 미확보를 일정 부재로 단정하지 않음.',newlyConfirmedCodes:additions.map(r=>r.code),blockedCandidateCodes:['226950']};
s.releaseId=releaseId;s.checkedAt=at;
Object.assign(s.research,{releaseId,checkedAt:at,eventIds:s.events.map(e=>e.id)});
fs.writeFileSync(path,JSON.stringify(s));
console.log({releaseId,added:additions.map(r=>r.code),unresolved:f.unresolvedCodes.length});

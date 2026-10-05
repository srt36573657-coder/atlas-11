import fs from 'node:fs';
const p='public/data/researched-news.json',s=JSON.parse(fs.readFileSync(p));
if(s.releaseId==='official-news-20260925-5')process.exit(0);
if(s.releaseId!=='official-news-20260925-4')throw Error('기존 릴리스와 충돌: 원본을 보존하고 병합해야 합니다.');
const at=new Date().toISOString(),releaseId='official-news-20260925-5';
const additions=[
 {code:'012330',id:'REVIEW:COMPANY_REDISCLOSURE-012330-20261023',name:'현대모비스 램프사업 거래 검토 재공시 예정',kind:'COMPANY_REDISCLOSURE',date:'2026-10-23',url:'https://kind.krx.co.kr/external/2026/04/24/000001/20260417000982/99583.htm',source:'한국거래소 KIND 현대모비스 2026.04.24 조회공시 답변',channel:'2026-10-23은 램프사업 거래 검토 재공시 예정일. 프랑스 OPmobility와 양해각서는 구속력 없고 거래 조건 미확정. 매각 확정일 아님. 비교 과거 사건 표본 부족으로 수치 영향 유보.',basis:'원문 제1~4행 회사명·미확정 거래 상태와 제12행 재공시예정일 직접 대조. 재공시 전 확정 시 더 일찍 공시할 수 있음.'},
 {code:'000720',id:'REVIEW:COMPANY_IR-000720-20260930',name:'현대건설 미래에셋증권 Corporate Day 2026 기업설명회',kind:'COMPANY_IR',date:'2026-09-30',url:'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260923800045',source:'DART 현대건설 2026.09.23 기업설명회 개최 공시',channel:'한국시간 14:30, 미래에셋증권 센터원. 기관투자자 대상 경영현황·계획 설명 및 질의응답. 신규 수주나 실적 결과가 확정된 일정 아님. 비교 과거 사건 표본 부족으로 수치 영향 유보.',basis:'DART 본문 iframe에서 현대건설·2026-09-30 14:30·센터원·국내 기관투자자·경영현황과 계획을 직접 대조.'}
];
for(const a of additions){
 if(s.events.some(e=>e.id===a.id))throw Error('이벤트 ID 중복');
 s.events.push({id:a.id,name:a.name,kind:a.kind,eventDate:a.date,announcementDate:a.date,targetDate:a.date,scope:{type:'company',codes:[a.code]},availableAt:at,firstObservedAt:at,publishedAt:null,status:'scheduled',sources:[{name:a.source,url:a.url,retrievedAt:at}],channel:a.channel,reference:'공식 일정 확인 · 발표 결과 미공개 · 가격 효과 미검증',dateBasis:'공식 예정 날짜를 표시. 실제 주가 반영이나 거래 결과 확정이 아님.',importance:'review',reviewReleaseId:releaseId});
 const r=s.research.assets.find(v=>v.code===a.code);Object.assign(r,{status:'company_schedule_confirmed',checkedAt:at,note:a.channel,researchBasis:a.basis});r.sources=[{name:a.source,url:a.url},...r.sources.filter(v=>v.url!==a.url)];
}
const improved={
 '005380':['공식 현대차 IR 미래 예정 행사 없음 확인. 이미 종료된 9/21~22 NDR는 제외.','https://www.hyundai.com/worldwide/ko/company/ir/ir-events'],
 '105560':['9/21·23 IR 경과. 회사 투자자 안내에 3분기 확정 실적 날짜 아직 없음.','https://kbfg.com/kor/ir/investor/list.jsp'],
 '028260':['삼성물산 FutureScape 데모데이는 회사가 10월까지만 공지; 일자 미정.','https://samsungcnt.com/ir/event-earnings/ir-event.do'],
 '034730':['SK주식회사 IR 최신 8/14 발표, 향후 날짜 공표 미확인. SK계열사 소식은 별도.','https://sk-inc.com/kr/ir/irArchive.aspx'],
 '005490':['공식 IR FAQ는 3분기 실적을 통상 10월 말로 안내할 뿐 날짜 확정 아님.','https://www.posco-inc.com/hs91a1-front/app/ir/ir-contact/ir-faq.html'],
 '010130':['10/5 회사채 수요예측 보도는 대체공휴일과 겹치며 원문 확정 공시 확인 실패. 보도상 계획으로만 보류.','https://investors.koreazinc.co.kr/'],
 '138040':['메리츠금융지주 공식 IR에서 9/25~10/30 확정일 미발견. 메리츠증권 일정을 혼입하지 않음.','https://www.meritzgroup.com/web/ko/ir/ir1.do'],
 '051910':['LG화학 공식 IR 마지막 확인 일정 9/7~11, 10월 2025년 실적일을 2026년에 복사하지 않음.','https://www.lgchem.com/company/investment-information/ir-events?lang=ko_KR'],
 '033780':['KT&G 공식 IR 마지막 8/24~25. 9/23~12/22 자사주 매입은 진행 기간, 소각일 미정.','https://en.ktng.com/ir/ir-archives/events'],
 '047050':['포스코인터내셔널 공식 IR 활동 최근 9/16, 미래 확정일 미게시.','https://www.poscointl.com/irActivity'],
 '029780':['삼성카드 10/28 일정은 2025년 자료. 2026년 공식 확정일 미발견.','https://biz.samsungcard.com/company/IR/investor-relatioin/calender/UHPPCI0143M0.jsp'],
 '002380':['KCC IR 자료 마지막 8/19 확인, 당해 10월 확정일 미발견.','https://kccworld.irpage.co.kr/'],
 '004170':['신세계 9/21 IR은 종료. 2026년 공식 IR은 5월까지 게시, 올해 10월 공지 미확인.','https://deptmapp.shinsegae.com/company/ir-ko/ir.do'],
 '111770':['영원무역 공식 IR 최신 8/21 자료와 8/11 공고 확인, 새 확정 일정 미발견. 영원무역홀딩스와 구분.','https://www.youngone.co.kr/invest/youngone/ir-yo/'],
 '035250':['강원랜드 최근 DART 공시 및 IR 목록에 10월 확정 투자자 행사는 미발견. 단순 입찰·채용을 가격 뉴스로 만들지 않음.','https://dart.fss.or.kr/'],
 '226950':['올릭스 10/7 행사 날짜는 주최자 원문, 참가 보도는 연합뉴스에 있으나 주최자 참가 명단 원문 접속 실패. 공식 참가 검증 전 집계 유보.','https://koreaweeks.com/sub-weeks.php?company=kosdaq-ir-day&date=10-07'],
 '010170':['대한광통신 DART 최근 공시 8/14까지 확인. 10/28 제9회 CB는 과거 전량 상환되어 해당일 상환 이벤트 제외.','https://www.taihanfiber.com/about/investor.html'],
 '030000':['제일기획 한국 공식 IR은 현재 진행 예정 이벤트가 없다고 표시. 2026 10/30 민간 추정 실적은 제외.','https://www.cheil.com/kr/ir/']
};
for(const [code,[newNote,url]] of Object.entries(improved)){
 const r=s.research.assets.find(v=>v.code===code);r.checkedAt=at;r.note=[r.note,newNote].join(' ');if(!r.sources.some(v=>v.url===url))r.sources.unshift({name:'9/25 공식 일정 재확인 경로',url});
}
const f=s.research.followup25;f.fullyConfirmedCompanyScheduleCodes=[...new Set([...f.fullyConfirmedCompanyScheduleCodes,...additions.map(v=>v.code)])];f.unresolvedCodes=f.requestedCodes.filter(v=>!f.fullyConfirmedCompanyScheduleCodes.includes(v));f.complete=f.unresolvedCodes.length===0;f.note=`25종목 중 ${f.fullyConfirmedCompanyScheduleCodes.length}종목 공식 일정 확인, ${f.unresolvedCodes.length}종목 공식 확정일 미확보. 이 가운데 일부는 월만 발표되었거나 원문 참가 명단 접속 불가. 기간 내 일정 부재 확정이 아님.`;
s.research.batchReviewHistory=[...(s.research.batchReviewHistory??[]),s.research.batchReview];
s.research.batchReview={checkedAt:at,requestedCodes:f.unresolvedCodes.concat(additions.map(v=>v.code)),searchedCount:20,newlyConfirmedCodes:additions.map(v=>v.code),unresolvedCodes:f.unresolvedCodes,policy:'네 묶음 병렬 공식 IR·공시 조사, 원문 확인 성공만 기업 일정 편입. 보도·추정·과거연도·다른 회사·월 단위는 사유와 함께 보류.',primaryOriginalVerified:['012330','000720'],pendingParticipantList:['226950']};
s.releaseId=releaseId;s.checkedAt=at;Object.assign(s.research,{releaseId,checkedAt:at,eventIds:s.events.map(v=>v.id)});fs.writeFileSync(p,JSON.stringify(s));console.log({releaseId,added:additions.map(v=>v.id),unresolved:f.unresolvedCodes.length});

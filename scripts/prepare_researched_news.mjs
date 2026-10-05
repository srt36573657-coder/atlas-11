import fs from 'node:fs';
const input=JSON.parse(fs.readFileSync('public/data/input.json')),at=new Date().toISOString(),releaseId='official-news-20260925-1',events=[];
const company=code=>({type:'company',codes:[code]}),sector=codes=>({type:'sector',sectors:codes.split(',').map(c=>input.assets.find(a=>a.code===c).sector)});
function add(id,name,kind,date,targetDate,scope,url,channel,extra={}){
 events.push({id:'REVIEW:'+id,name,kind,eventDate:date,announcementDate:date,targetDate,scope,availableAt:at,firstObservedAt:at,publishedAt:null,status:date>input.actualAsOf?'scheduled':'occurred',sources:[{name:'공식 원문',url,retrievedAt:at}],channel,reference:'공식 일정 확인 · 결과 미공개',dateBasis:'행사·적용일을 한국 거래일에 표시한 것. 주가 반영 시점이 확정됐다는 뜻이 아님.',importance:'review',reviewReleaseId:releaseId,...extra});
}
add('SAMSUNG-RECORD','삼성전자 분기배당 기준일','DIVIDEND_RECORD','2026-09-30','2026-09-30',company('005930'),'https://www.samsung.com/global/ir/','배당 기준일 확인. 배당 금액은 이사회 후 공시 예정으로 미확정. 배당락일이나 주가 상승을 임의로 가정하지 않습니다.');
const fuel=m=>'https://www.koreanair.com/contents/footer/customer-support/notice/2026/'+(m==='06'?'2506':'26'+m)+'-infuel';
for(const m of ['01','04','05','06','07','08','09','10']){
 const date='2026-'+m+'-01',target=input.calendar.sessions.find(d=>d>=date);
 add('KE-FUEL-'+date.replaceAll('-',''),'대한항공 '+Number(m)+'월 국제선 유류할증료 적용','AIRLINE_FUEL_POLICY',date,target,company('003490'),fuel(m),'발권일 기준 적용 정책입니다. 노선별 증감이 다르며 비용·매출과 주가 방향을 동일시하지 않습니다. 과거 적용일 반응은 공지일 반응·유가 변화의 인과 효과가 아닙니다.');
}
const hybe='https://weverse.io/bts/notice/39450';
add('HYBE-CINE-GLOBAL-TICKETS','하이브 영화제 글로벌 예매 시작','HYBE_CINE_TICKETS','2026-09-30','2026-10-01',company('352820'),hybe,'공식 글로벌 예매 9/30 오전 6시 PDT → 한국 22시. 다음 거래일 표시. 예매 수량·매출·이익은 미공개.',{timeZone:'America/Los_Angeles',releaseTime:'06:00',relatedEventGroup:'HYBE-CINE-2026'});
add('HYBE-JAPAN-CONCERT','BOYNEXTDOOR 일본 공연·온라인 생중계','HYBE_CONCERT','2026-10-10','2026-10-12',company('352820'),'https://concerts.weverse.io/events/knockon_vol_2_in_japan','10/10~11 일본 공연. 주말 행사이므로 10/12에 표시. 관객 수·순이익 결과는 알 수 없습니다.');
add('HYBE-CINE-KOREA-TICKETS','하이브 영화제 한국 예매 시작','HYBE_CINE_TICKETS','2026-10-15','2026-10-15',company('352820'),hybe,'한국 예매 10/15 오전 10시. 같은 영화제의 여러 일정을 독립적인 매출 호재로 합산하지 않습니다.',{timeZone:'Asia/Seoul',releaseTime:'10:00',relatedEventGroup:'HYBE-CINE-2026'});
add('HYBE-CINE-FEST','하이브 영화제 시작','HYBE_CINE_FEST','2026-10-24','2026-10-26',company('352820'),hybe,'10/24~31 세계 영화제. 주말 시작을 10/26에 표시. 흥행·이익·주가 결과는 미확정.',{relatedEventGroup:'HYBE-CINE-2026'});
add('KOGAS-INSTALLMENT','한국가스공사 소상공인 분할납부 적용월 시작','GAS_PAYMENT_POLICY','2026-10-01','2026-10-01',company('036460'),'https://www.kogas.or.kr/site/koGas/1020408070000','10월~다음 해 3월 가스요금 분할납부 안내. 10/1은 적용월 시작 표시이며 공지일 또는 개별 고객 납부일이 아닙니다. 이익 영향은 미확인.',{datePrecision:'month'});
const sectors=[
 ['SLW-2026','스마트라이프위크','2026-10-06','2026-10-06','035420,017670,030200,018260','https://smartlifeweek.seoul.kr/eng/contents/945.do?mid=1029','10/6~8 스마트도시·AI·통신 관련 행사'],
 ['AUSA-2026','AUSA 방산 전시회','2026-10-12','2026-10-13','012450','https://meetings.ausa.org/annual/2026/','10/12~14 미국 행사. 한국 다음 거래일 표시'],
 ['KES-2026','한국전자전','2026-10-13','2026-10-13','009150,066570,021240,034220','https://www.coex.co.kr/exhibitions/kes-2026한국전자전/','10/13~16 전자·부품·가전·디스플레이 행사'],
 ['SEDEX-2026','반도체대전 SEDEX','2026-10-14','2026-10-14','005930','https://sedex.org/public_html_eng/summary/summary_info.asp','10/14~16 반도체 산업 전시'],
 ['KBEAUTY-2026','K-BEAUTY EXPO KOREA','2026-10-15','2026-10-15','278470,257720','https://kioca.org/k-beauty-expo-korea-2026/','10/15~17 뷰티 산업·유통 행사. 협회 공식 검색자료 확인, 원문 직접 접근 제한'],
 ['SIAL-2026','SIAL 파리 식품 전시회','2026-10-17','2026-10-19','003230','https://www.sialparis.com/the-show/why-visit-SIAL-Paris','10/17~21 식품 산업 행사. 주말 이후 거래일 표시'],
 ['STEAM-2026','Steam Next Fest','2026-10-19','2026-10-20','259960','https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/2026october?l=koreana','10/19 오전 10시 PDT 시작, 한국 다음 거래일 표시. 해당 회사 게임 참가·흥행 미확정'],
 ['ESMO-2026','ESMO 종양학 학회','2026-10-23','2026-10-26','207940,196170,028300','https://www.ifema.es/en/esmo-congress','10/23~27 마드리드 학회. 세부 시각 미확인으로 다음 한국 거래일 표시. 임상 결과·승인을 가정하지 않음'],
 ['MARITIME-2026','대한민국 해양모빌리티·안전 엑스포','2026-10-26','2026-10-26','011200,329180','https://www.mof.go.kr/doc/ko/selectDoc.do?bbsSeq=10&docSeq=67544&listUpdtDt=2026-07-22++10%3A00&menuSeq=971','10/26~28 해양 산업 행사'],
 ['ENERGY-2026','스마트에너지플러스','2026-10-28','2026-10-28','373220,010120,015760,009830,018260','https://www.coex.co.kr/exhibitions/스마트에너지플러스-2026-2/','10/28~30 에너지·ESS·전력·데이터 관련 전시'],
 ['KOS-2026','대한안과학회 추계학술대회','2026-10-30','2026-10-30','214370','https://www.kosmeeting.org/abstract/2026_136/booth/sub02.html','10/30~11/1 안과 학회. 케어젠 안과 연구와 관련된 관찰 일정. 올릭스는 연결 근거 부족으로 제외'],
];
for(const [id,name,date,target,codes,url,note]of sectors)add(id,name,'INDUSTRY_'+id,date,target,sector(codes),url,note+'. 업종 관련성에 따른 관찰 일정이며 개별 기업 참가·수주·매출을 확인했다는 뜻은 아닙니다.');
// Restored concise review notes; links and source access are not counted as news.
const notes=`005930|https://www.samsung.com/global/ir/|분기배당 기준일 확인. 실적 확정 발표일은 미확인.
009150|https://samsungsem.com/kr/about-us/investor-relations/earnings-release.do|7/30 분기 실적 확인. 다음 확정 발표일 미확인.
373220|https://www.lgensol.com/kr/investors/earnings-announcement|분기 실적 자료 조사. 10월 가동일·발표일 미확인.
005380|https://org3.hyundai.com/worldwide/en/company/ir|9월 IR 활동 확인. 다음 실적 확정일 미확인.
207940|https://samsungbiologics.com/kr/ir/resource/notice-view?boardseq=3722|주주 안내·유상증자 설명회 자료 조사. 상세 미래 날짜 재확인 필요.
105560|https://www.kbfg.com/kor/ir/mgt-performance/list.jsp|공식 실적 게시판 조사. 10월 확정일 미확인.
028260|https://samsungcnt.com/ir/event-earnings/ir-event.do|발표 약 2주 전 안내 방침. 전년도 날짜를 복사하지 않음.
032830|https://www.samsunglife.com/individual/display/invest/PDE-IRIVI011180M|자바스크립트 화면으로 일정 원문 접근 제한.
012450|https://www.hanwhaaerospace.com/|2026 AUSA 개별 기업 참가 미확정. 업종 일정만 연결.
034020|https://www.doosanenerbility.com/kr/investment/ir_data|분기 실적·수주 소식 조사. 10월 확정 이행일 미확인.
329180|https://www.hhi.co.kr/IR/ir06_2_2|IR 예약은 행사 공시가 아님. 이동 페이지 접근 제한.
034730|https://sk-inc.com/kr/ir/irArchive.aspx|SK 자체 IR 조사. 자회사 일정을 모회사 행사로 복사하지 않음.
012330|https://www.mobis.com/kr/aboutus/press.do?category=press&idx=6261|공장 개소·협력사 지원 소식 확인. 다음 이행일 미확인.
066570|https://www.lge.co.kr/company/investor/presentation|분기 실적 조사. 전자전은 업종 일정이며 실적일 미확인.
035420|https://www.navercorp.com/investment/irUpdates|공식 IR·9월 공시 목록 조사. 미래 회사 확정일 미확인.
010120|https://www.ls-electric.com/ko/company/invest/ir/|민간 사이트 예상 실적일을 확정일로 채택하지 않음.
000810|https://www.samsungfire.com/vh/page/VH.HPMK0207.do|IR 일정 추출 제한. 기업 확정일 재확인 필요.
005490|https://www.posco-inc.com/hs91a1-front/app/ir/disclosure-information.html|분기배당 공고 조사. 예상 실적일은 확정 근거 미확인.
010130|https://www.koreazinc.co.kr/|기업 고유 예정일 미확보. 날짜를 확인한 원문 추가 필요.
138040|https://www.meritz.co.kr/|자사주 환원 공시 조사. 10월 특정 소각일 미확인.
015760|https://home.kepco.co.kr/|전력 산업 일정 연결. 요금 변경·이익 결과는 미확정.
011200|https://www.hmm21.com/|해양 산업 행사 연결. 개별 수주·운임 결과 미확정.
051910|https://www.lgchem.com/|기업 고유 예정일 미확보. 확정 공시 날짜 추가 확인 필요.
017670|https://ir.gsifn.io/sktelecom/ir_disclosure.html|공시 목록 조사. 종속회사 분할을 임의의 10월 일정으로 바꾸지 않음.
033780|https://en.ktng.com/media/news/press-release/detail/310017|4분기 환원 정책 계획은 정확한 발표일이 없어 제외.
196170|https://www.alteogen.com/|종양학 업종 일정만 연결. 개별 임상 결과·승인 미확정.
018260|https://www.samsungsds.com/|스마트도시·에너지 데이터 업종 일정 연결. 개별 참가 미확정.
086280|https://www.glovis.net/|기업 고유 예정일 미확보. 구체적인 미래 이행 공시 필요.
000720|https://www.hdec.kr/|기업 고유 예정일 미확보. 수주 결과를 미리 가정하지 않음.
278470|https://www.apr-in.com/ir.php|분기 실적 조사. 박람회 업종 연결, 참가·출시 미확정.
030200|https://corp.kt.com/|통신·스마트도시 업종 일정 연결. 기업 고유 확정일 미확인.
003490|https://www.koreanair.com/contents/footer/customer-support/notice/2026/2610-infuel|10월 정책·과거 7개 적용월 확인. 과거 공지 시각 빈티지는 미확보.
047050|https://www.poscointl.com/|기업 고유 예정일 미확보. 미래 이행일 추가 확인 필요.
003230|https://www.samyangfoods.com/|식품 전시 업종 연결. 참가·수출 수주 결과 미확정.
259960|https://www.krafton.com/|게임 행사 업종 연결. 회사 게임 참가·흥행 미확정.
021240|https://company.coway.com/ko/newsroom/press?q=IR|회사 실적·IR 조사. 10월 회사 확정일 미확인.
352820|https://weverse.io/bts/notice/39450|공연·영화제·예매 일정 확인. 매출·관객·이익 미확정.
009830|https://www.hanwhasolutions.com/|에너지 업종 행사 연결. 사업 이익·수주 미확정.
029780|https://www.samsungcard.com/|기업 고유 예정일 미확보. 회사 발표 원문 재확인 필요.
028300|https://www.hlbkorea.com/|종양학 행사 업종 연결. 임상 결과·의약품 승인 날짜 가정 금지.
034220|https://www.lgdisplay.com/kor/company/investment/ir-activity|공식 IR 자료 조사. 발표 월과 확정 날짜를 구분.
002380|https://kccworld.irpage.co.kr/|공시 지정 IR 조사. 10월 확정 행사 미확인.
036460|https://www.kogas.or.kr/site/koGas/1020408070000|분할납부는 10월 적용월 시작 표시. 개별 납부일 아님.
004170|https://www.shinsegae.com/|기업 고유 예정일 미확보. 개별 공시 일정 추가 확인 필요.
012750|https://www.s1.co.kr/company/introduction/introduction|투자정보 경로 확인. 다음 행사 원문 미확인.
111770|https://www.youngone.co.kr/|기업 고유 예정일 미확보. 회사별 수출 실적 결과 미확정.
035250|https://kangwonland.high1.com/|기업 고유 예정일 미확보. 실적·정책 확정일 추가 확인 필요.
257720|https://www.siliconii.com/|뷰티 유통 업종 행사 연결. 개별 참가·주문 미확정.
226950|https://www.olixpharma.com/|안과 행사에 연결할 현재 근거가 부족해 제외. 임상 결과 가정 금지.
010170|https://www.tfo.co.kr/|기업 고유 예정일 미확보. 미래 공급계약 공시 추가 확인 필요.
214370|https://www.caregen.co.kr/133/?bmode=view&idx=172528743|안과 연구 자료에 따라 학회 관찰 연결. 개별 참가·연구 결과 미확정.
030000|https://www.cheil.com/|기업 고유 예정일 미확보. 회사 확정 발표일 추가 확인 필요.`;
const assets=notes.split('\n').map(line=>{const [code,url,note]=line.split('|'),a=input.assets.find(a=>a.code===code);if(!a)throw Error(code);return {code,name:a.name,sector:a.sector,note,checkedAt:at,status:'date_not_confirmed',sources:[{name:'기업 조사 경로',url}],researchBasis:'9/24 조사 요약 복원. 홈페이지 링크 자체는 일정 확인 근거가 아님. 확인된 사건의 원문은 개별 뉴스에 별도 수록.'};});
if(assets.length!==52||events.length!==25)throw Error('누락');
const research={schema:1,releaseId,checkedAt:at,eventIds:events.map(e=>e.id),assets,period:{origin:input.origin,end:input.end},publicationPolicy:'공개 시각 미확인 자료는 이번 재입력 시각부터만 계산. 최초 9/17 전망에 소급하지 않음.',pending:[{id:'KRX-MEMBERSHIP',name:'지수 구성 근거 미확보',note:'코스피200 옵션 규칙은 조사했으나 해당 날짜 구성종목 근거가 부족해 전체 52종목으로 확장하지 않았습니다.',sources:[{url:'https://global.krx.co.kr/contents/GLB/02/0201/0201040202/GLB0201040202.jsp'}]}]};
fs.writeFileSync('public/data/researched-news.json',JSON.stringify({releaseId,checkedAt:at,events,research},null,2));
console.log({events:events.length,assets:assets.length,releaseId});

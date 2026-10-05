/** Acquisition and review ledger. None of these functions certifies a historical vintage. */
import { createHash } from 'node:crypto';

export const MARKET_SERIES = Object.freeze([
  { id:'DFII10',factorId:'F04',unit:'percent',frequency:'daily',componentOnly:false,license:'public_domain_citation_requested',label:'미국 10년 물가연동채 실질수익률' },
  { id:'DEXKOUS',factorId:'F06',unit:'KRW_per_USD',frequency:'daily',componentOnly:true,license:'public_domain_citation_requested',label:'뉴욕 정오 원/달러 매입환율',missing:['기업별 외화 매출·원가·부채·헤지 노출'] },
  { id:'IRLTLT01KRM156N',factorId:'F03',unit:'percent',frequency:'monthly',componentOnly:true,license:'review_required',label:'한국 10년 국채수익률 월평균',missing:['동일 만기체계의 단기 국고채','일간 한국 장단기곡선'] },
  { id:'WALCL',factorId:'F07',unit:'USD_million',frequency:'weekly',componentOnly:true,license:'public_domain_citation_requested',label:'미국 연준 총자산 수요일 잔액',missing:['한국 통화·대출·은행자금 이력','공개 당시 개정 빈티지'] },
  { id:'SP500',factorId:'F09',unit:'index_points',frequency:'daily',componentOnly:false,license:'preapproval_required',label:'S&P 500 종가',missing:['지수 재배포 사용권','당시 이용 가능 시각'] },
  { id:'VIXCLS',factorId:'F10',unit:'index_points',frequency:'daily',componentOnly:false,license:'review_required',label:'Cboe VIX 종가',missing:['사용권 확인','당시 이용 가능 시각'] },
  { id:'BAA10Y',factorId:'F05',unit:'percentage_points',frequency:'daily',componentOnly:true,license:'review_required',label:'미국 Baa 회사채와 미 국채10년 수익률 차이',missing:['한국 기업별 신용노출','파생 원자료 사용권 확인'] },
  { id:'CPIAUCSL',factorId:'F12',unit:'index_1982_1984_100',frequency:'monthly',componentOnly:true,license:'public_domain_citation_requested',label:'미국 CPI 계절조정 지수',missing:['발표 전 시장 예상','발표 당시 원본과 개정 빈티지'] },
  { id:'XTEXVA01KRM667S',factorId:'F13',unit:'USD',frequency:'monthly',componentOnly:true,license:'review_required',label:'한국 상품수출 계절조정 월간 금액',missing:['발표 전 시장 예상','실제 발표 시각과 당시 빈티지'] },
  { id:'DGS10',factorId:null,unit:'percent',frequency:'daily',componentOnly:true,license:'public_domain_citation_requested',label:'미국 국채10년: 한국 국고채 F03 대체 금지' },
  { id:'DGS2',factorId:null,unit:'percent',frequency:'daily',componentOnly:true,license:'public_domain_citation_requested',label:'미국 국채2년: 한국 국고채 F03 대체 금지' },
  { id:'IRSTCI01KRM156N',factorId:null,unit:'percent',frequency:'monthly',componentOnly:true,license:'review_required',label:'한국 콜금리: 기준금리·단기 국고채 대체 금지' },
  { id:'IR3TIB01KRM156N',factorId:null,unit:'percent',frequency:'monthly',componentOnly:true,license:'review_required',label:'한국3개월 은행간금리: 단기 국고채 대체 금지' },
  { id:'INTDSRKRM193N',factorId:null,unit:'percent_per_annum',frequency:'monthly',componentOnly:true,license:'review_required',label:'IMF 한국 재할인율: 한국은행 기준금리 대체 금지' },
]);
export const marketHash = value => createHash('sha256').update(value).digest('hex');
const validDay = x => /^\d{4}-\d{2}-\d{2}$/.test(x) && Number.isFinite(Date.parse(x+'T00:00:00Z')) && new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
export function fredURL(series) {
  if (!MARKET_SERIES.some(s=>s.id===series)) throw new Error('UNKNOWN_SERIES');
  return 'https://fred.stlouisfed.org/graph/fredgraph.csv?id='+series;
}
export function splitWebExtract(response) {
  return (response?.content||[]).filter(x=>x.type==='text').flatMap(x=>x.text.split(/\n-+\n/));
}
/** A web tool body hash is a hash of its extracted text, not the HTTP entity. */
export function parseFredBody(text, series, { observedAt, from='2023-01-01', to='2026-10-30', representation='web_text_extract' }={}) {
  const spec=MARKET_SERIES.find(s=>s.id===series);if(!spec)throw new Error('UNKNOWN_SERIES');
  if(!observedAt||!/(?:Z|[+-]\d\d:\d\d)$/.test(observedAt)||!Number.isFinite(Date.parse(observedAt)))throw new Error('OBSERVATION_TIMESTAMP_REQUIRED');
  const csv = representation==='http_csv';
  if(csv){const head=text.split(/\r?\n/)[0].replace(/^\uFEFF/,'');if(!new RegExp('^(DATE|observation_date),'+series+'$').test(head))throw new Error('SERIES_HEADER_MISMATCH');}
  else if(!text.includes('fred.stlouisfed.org/data/'+series)&&!new RegExp('Series ID\\s*\\|\\s*'+series+'(?:\\s|$)').test(text))throw new Error('SERIES_HEADER_MISMATCH');
  const pattern=csv?/^(\d{4}-\d\d-\d\d),([^\r\n]*)$/gm:/(\d{4}-\d\d-\d\d)\s*\|\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)|\.)(?=\s|#|$)/g;
  const rows=new Map(),conflicts=[],rejected=[];
  for(const m of text.matchAll(pattern)){
    const date=m[1],token=m[2].trim();if(!validDay(date)){rejected.push({date,reason:'invalid_date'});continue;}
    if(date<from||date>to||date>observedAt.slice(0,10))continue;
    const value=token==='.'||token===''?null:Number(token);if(value!==null&&!Number.isFinite(value)){rejected.push({date,reason:'invalid_number'});continue;}
    if(rows.has(date)&&rows.get(date)!==value){conflicts.push({date,before:rows.get(date),after:value});continue;}rows.set(date,value);
  }
  return {series,unit:spec.unit,rows:[...rows].sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({date,value})),conflicts,rejected,sourceUrl:'https://fred.stlouisfed.org/data/'+series,observedAt,publishedAt:null,pointInTimeVerified:false,rawHash:marketHash(text),rawHashRepresentation:representation};
}
export function mergeCapturedSeries(parts,spec) {
  const rows=new Map(),conflicts=[],sources=[];
  for(const p of parts){if(p.series!==spec.id)throw new Error('CROSS_SERIES_MERGE');sources.push({url:p.sourceUrl,rawHash:p.rawHash,observedAt:p.observedAt,representation:p.rawHashRepresentation});conflicts.push(...p.conflicts);
    for(const r of p.rows){if(rows.has(r.date)&&rows.get(r.date)!==r.value)conflicts.push({date:r.date,before:rows.get(r.date),after:r.value});else rows.set(r.date,r.value);}}
  const conflictDates=new Set(conflicts.map(x=>x.date));const all=[...rows].sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({date,value:conflictDates.has(date)?null:value,status:conflictDates.has(date)?'conflict':value===null?'provider_missing':'observed_current_vintage'}));
  const valid=all.filter(r=>r.value!==null);const missing=all.filter(r=>r.value===null);
  const holes=[];if(spec.frequency==='daily'&&all.length){for(let d=new Date(all[0].date+'T00:00:00Z');d.toISOString().slice(0,10)<=all.at(-1).date;d.setUTCDate(d.getUTCDate()+1)){const day=d.toISOString().slice(0,10);if(d.getUTCDay()!==0&&d.getUTCDay()!==6&&!rows.has(day))holes.push(day);}}
  return {schema:'atlas-market-series-quarantine-1',...spec,sourceVerified:valid.length>0,bodyRead:true,scope:'market',rows:all,sources:[...new Map(sources.map(x=>[x.rawHash,x])).values()],count:valid.length,missingCount:missing.length,unobservedWeekdays:holes,conflicts,historyStart:valid[0]?.date||null,historyEnd:valid.at(-1)?.date||null,historyComplete:false,publicationAtPerObservation:null,pointInTimeVerified:false,approvedForModel:false,importReady:false,blockers:[...(spec.missing||[]),'공개 당시 빈티지와 종목별 학습 추가예측력 미검증',...(holes.length?['추출되지 않은 평일 존재: 휴일 여부 검증 전 보간 금지']:[]),...(conflicts.length?['같은 날짜 상충값 존재']:[])]};
}
export function parseFedPolicy(text,{observedAt,from='2023-01-01'}={}){
  if(!text.includes('https://www.federalreserve.gov/monetarypolicy/openmarket.htm'))throw new Error('POLICY_SOURCE_MISMATCH');
  let year=null;const rows=[];const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  for(const line of text.split('\n')){const h=line.match(/#### (\d{4})/);if(h){year=h[1];continue;}const m=line.match(/(?:L\d+:\s*)?([A-Z][a-z]+) (\d{1,2})(?:【[^】]*】)?\s*\|\s*[^|]+\|\s*[^|]+\|\s*(\d+(?:\.\d+)?)(?:-(\d+(?:\.\d+)?))?/);if(!m||!year||!months.includes(m[1]))continue;const date=`${year}-${String(months.indexOf(m[1])+1).padStart(2,'0')}-${m[2].padStart(2,'0')}`;if(date<from)continue;rows.push({date,lower:Number(m[3]),upper:Number(m[4]??m[3]),publishedAt:null,observedAt,expectedBefore:null,surprise:null});}
  return {factorId:'F02',series:'FED_POLICY_TARGET_CHANGES',unit:'percent',rows:rows.sort((a,b)=>a.date.localeCompare(b.date)),count:rows.length,sourceVerified:rows.length>0,componentOnly:true,sourceUrl:'https://www.federalreserve.gov/monetarypolicy/openmarket.htm',rawHash:marketHash(text),observedAt,pointInTimeVerified:false,importReady:false,blockers:['정책 목표범위 변경 이력이며 유효일과 발표일은 다름','사전 시장 예상·각 공시시각·당시 관측 빈티지 미확보']};
}

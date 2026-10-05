// Official export import boundary. Acquisition, historical availability and predictive use are distinct.
import { createHash } from 'node:crypto';

export const FLOW_FACTORS = Object.freeze(['F14','F15','F16','F17','F18','F19','F20','F21','F22','F23','F24']);
const finite = x => typeof x === 'number' && Number.isFinite(x);
const iso = x => typeof x === 'string' && /(Z|[+-]\d{2}:\d{2})$/.test(x) && Number.isFinite(Date.parse(x));
function date(x) { return typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && Number.isFinite(Date.parse(x)) && new Date(x).toISOString().slice(0,10) === x; }
function invariant(ok, code) { if (!ok) throw Error(code); }
export function flowNumber(value) {
  if (typeof value === 'number') { invariant(finite(value), 'FLOW_NONFINITE'); return value; }
  invariant(typeof value === 'string' && value.trim() && !['-','N/A','NA','null'].includes(value.trim()), 'FLOW_MISSING_VALUE');
  const t = value.trim().replace(/\u2212/g, '-');
  invariant(/^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(t), 'FLOW_INVALID_NUMBER');
  const n = Number(t.replace(/,/g,'')); invariant(finite(n), 'FLOW_NONFINITE'); return n;
}
export function parseFlowCsv(text) {
  invariant(typeof text === 'string' && text.length < 20_000_000, 'FLOW_CSV_SIZE');
  const rows=[]; let row=[], cell='', quoted=false;
  for (let i=0;i<text.length;i++) { const c=text[i];
    if(c==='"') { if(quoted && text[i+1]==='"') {cell+='"';i++;} else {invariant(quoted || !cell, 'FLOW_CSV_QUOTE');quoted=!quoted;} }
    else if(c===','&&!quoted){row.push(cell);cell='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x!==''))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  invariant(!quoted,'FLOW_CSV_UNCLOSED_QUOTE');if(cell||row.length){row.push(cell);rows.push(row);}
  invariant(rows.length>1,'FLOW_CSV_EMPTY');const headers=rows.shift().map((x,i)=>i===0?x.replace(/^\uFEFF/,''):x);
  invariant(new Set(headers).size===headers.length,'FLOW_CSV_DUPLICATE_HEADER');
  return rows.map(r=>{invariant(r.length===headers.length,'FLOW_CSV_COLUMNS');return Object.fromEntries(headers.map((h,i)=>[h,r[i]]));});
}
function provenance(meta, body) {
  invariant(meta && typeof meta==='object','FLOW_SOURCE_REQUIRED');
  invariant(!['factorId','scope','code','date','investor','value','unit','notDailyFlow','evidenceType','usedInForecast'].some(k=>Object.hasOwn(meta,k)),'FLOW_RESERVED_METADATA');
  const u=new URL(meta.sourceUrl);invariant(u.protocol==='https:'&&!u.username&&!u.password&&['data.krx.co.kr','openapi.krx.co.kr','fund.nps.or.kr','freesis.kofia.or.kr','dart.fss.or.kr','opendart.fss.or.kr'].includes(u.hostname),'FLOW_UNAPPROVED_SOURCE');
  invariant(iso(meta.observedAt),'FLOW_OBSERVED_TIME');
  invariant(meta.publishedAt===null||iso(meta.publishedAt),'FLOW_PUBLISHED_TIME');
  invariant(meta.publishedAt===null||Date.parse(meta.publishedAt)<=Date.parse(meta.observedAt),'FLOW_TIME_ORDER');
  invariant(typeof meta.rawHash==='string'&&/^[a-f0-9]{64}$/.test(meta.rawHash),'FLOW_RAW_HASH');
  if(body!==undefined) invariant(createHash('sha256').update(body).digest('hex')===meta.rawHash,'FLOW_RAW_HASH_MISMATCH');
  invariant(['permitted','review_required'].includes(meta.licensingStatus),'FLOW_LICENSE');
  return structuredClone(meta);
}

/** Import a user-downloaded KRX daily investor export after explicit column mapping.
 * rows must be long form; the original bytes/hash remain separate. Missing investor cells never become zero.
 * Values in KRW, thousand KRW and million KRW are normalized before any arithmetic.
 */
export function importInvestorFlows(rows,meta,{codes,body}={}) {
  provenance(meta,body); invariant(Array.isArray(rows)&&Array.isArray(codes),'FLOW_ROWS');
  const units={KRW:1,KRW_thousand:1000,KRW_million:1_000_000};
  const investors=new Set(['foreign','institution_total','pension_funds_etc','retail','other_corporations','other_foreign']);
  const seen=new Map();const normalized=[];
  for(const r of rows){
    invariant(codes.includes(r.code)&&/^\d{6}$/.test(r.code),'FLOW_TARGET');invariant(date(r.date)&&r.date<=meta.observedAt.slice(0,10),'FLOW_DATE');
    invariant(investors.has(r.investor),'FLOW_INVESTOR');invariant(r.investor!=='national_pension_service','FLOW_NPS_NOT_PENSION_AGGREGATE');
    invariant(Object.hasOwn(units,r.unit),'FLOW_UNIT');
    const value=flowNumber(r.netBuy)*units[r.unit];invariant(finite(value),'FLOW_OVERFLOW');
    const key=[r.code,r.date,r.investor].join('|');
    if(seen.has(key)){invariant(seen.get(key)===value,'FLOW_DUPLICATE_CONFLICT');continue;}seen.set(key,value);
    normalized.push({code:r.code,date:r.date,investor:r.investor,value,unit:'KRW',...structuredClone(meta),pointInTimeVerified:false});
  }
  return normalized;
}
/** Non-overlapping coordinates; prior turnover denominator must predate the flow day. */
export function flowFeatures(rows,turnoverRows,{asOf,codes}={}){
  invariant(iso(asOf),'FLOW_ASOF');const groups=new Map(),out=[];
  for(const r of rows){if(Date.parse(r.observedAt)>Date.parse(asOf)||r.publishedAt===null||Date.parse(r.publishedAt)>Date.parse(asOf))continue;
    invariant(codes.includes(r.code),'FLOW_TARGET');const key=r.code+'|'+r.date;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
  for(const rs of groups.values()){
    const a=rs[0],m=new Map(rs.map(r=>[r.investor,r])),ts=turnoverRows.filter(t=>t.code===a.code&&date(t.date)&&t.date<a.date&&finite(t.value)&&t.value>0&&t.unit==='KRW'&&iso(t.observedAt)&&Date.parse(t.observedAt)<=Date.parse(asOf)&&iso(t.publishedAt)&&Date.parse(t.publishedAt)<=Date.parse(asOf)).sort((x,y)=>x.date.localeCompare(y.date));
    const t=ts.at(-1); if(!t)continue;
    invariant(ts.filter(x=>x.date===t.date).every(x=>x.value===t.value),'FLOW_TURNOVER_CONFLICT');
    const factors=[['F14',m.get('foreign')?.value],['F17',m.get('pension_funds_etc')?.value],['F19',m.get('retail')?.value]];
    if(m.has('institution_total')&&m.has('pension_funds_etc'))factors.push(['F16',m.get('institution_total').value-m.get('pension_funds_etc').value]);
    for(const [factorId,v] of factors)if(finite(v))out.push({factorId,scope:'company',code:a.code,date:a.date,value:v/t.value,unit:'prior_turnover_ratio',rawNetBuyKRW:v,denominatorDate:t.date,denominatorKRW:t.value,sourceRows:structuredClone(rs),pointInTimeVerified:false,usedInForecast:false,reason:'당시 빈티지·공개 시각 검증과 학습·선택 평가 필요'});
  }
  return out;
}
/** NPS annual holdings are holdings, never inferred daily purchases or an F17 replacement. */
export function importNpsHoldings(rows,meta,{assets,year,body}={}){
  provenance(meta,body);invariant(Number.isInteger(year)&&year>=2000&&year<=Number(meta.observedAt.slice(0,4)),'NPS_YEAR');
  invariant(Array.isArray(rows)&&Array.isArray(assets),'NPS_ROWS');
  const aliases={'삼성생명보험':'삼성생명'};const matches=[],missing=[],seen=new Map();
  for(const a of assets){
    const match=rows.filter(r=>r.name===a.name||aliases[a.name]===r.name);
    invariant(match.length<=1,'NPS_AMBIGUOUS_COMPANY');if(!match.length){missing.push({code:a.code,name:a.name,value:null,reason:'원문에서 정확히 일치하는 보통주 이름 미확인 · 보유 0 의미 아님'});continue;}
    const r=match[0],value=flowNumber(r.holdingFraction),valuation=flowNumber(r.valuationKRW100m),weight=flowNumber(r.assetWeight);
    invariant(value>=0&&value<=1&&valuation>=0&&weight>=0&&weight<=1,'NPS_VALUE_RANGE');
    invariant(!seen.has(a.code),'NPS_DUPLICATE_CODE');seen.set(a.code,true);
    matches.push({factorId:'F18',scope:'company',code:a.code,name:a.name,sourceName:r.name,date:year+'-12-31',value,unit:'ownership_fraction',valuationKRW100m:valuation,assetWeight:weight,...structuredClone(meta),pointInTimeVerified:false,usedInForecast:false,evidenceType:'annual_disclosed_holding',sourceRow:r.sourceRow??null,notDailyFlow:true});
  }
  return {matches,missing};
}

export function validateFlowManifest(manifest,{codes}={}){
  invariant(manifest?.schema==='atlas-flow-export-1'&&Array.isArray(manifest.datasets),'FLOW_MANIFEST');
  const ids=new Set();for(const d of manifest.datasets){invariant(FLOW_FACTORS.includes(d.factorId)&&!ids.has(d.id),'FLOW_DATASET');ids.add(d.id);provenance(d.source);invariant(['company','market','index'].includes(d.scope),'FLOW_SCOPE');
    invariant(Array.isArray(d.targetCodes)&&d.targetCodes.every(x=>codes.includes(x)),'FLOW_TARGET');
    if(d.scope==='company')invariant(d.targetCodes.length===1,'FLOW_COMPANY_SCOPE');
    if(d.scope==='index')invariant(d.membershipSource&&iso(d.membershipPublishedAt)&&date(d.effectiveFrom)&&date(d.effectiveTo)&&d.effectiveFrom<=d.effectiveTo,'FLOW_INDEX_MEMBERSHIP');
    if(d.factorId==='F18')invariant(d.measure==='confirmed_holding'||d.measure==='official_allocation','FLOW_NPS_NOT_DAILY');
    if(d.factorId==='F17')invariant(d.measure==='pension_funds_etc_net_buy','FLOW_PENSION_LABEL');
    if(d.factorId==='F24')invariant(d.outstandingVerified===true&&finite(d.remainingShares)&&d.remainingShares>0,'FLOW_NO_OUTSTANDING_SUPPLY');
    if(d.factorId==='F22')invariant(d.scope==='index'&&date(d.announcementDate),'FLOW_REBALANCE_SCOPE');
  }return structuredClone(manifest);
}

export function extractKofiaSummary(html,meta,{year,dateEvidenceText=null,dateEvidenceHash=null}={}){
  provenance(meta,Buffer.from(html));invariant(Number.isInteger(year)&&year>=2000,'KOFIA_YEAR');
  const blocks=[...html.matchAll(/<dl>([\s\S]*?)<\/dl>/g)].map(m=>m[1]),out=[];
  for(const [name,factorId,series] of [['투자자예탁금','F08','OS0021'],['신용융자','F20','OS0026']]){
    const found=blocks.filter(x=>x.includes("clickJisuMenu('"+series+"')"));invariant(found.length===1,'KOFIA_SERIES');const b=found[0];
    invariant(b.includes(name),'KOFIA_LABEL');const unit=b.match(/class="dan">([^<]+)</)?.[1],md=b.match(/class="date">(\d{2}\/\d{2})</)?.[1];
    invariant(unit==='백만원'&&md,'KOFIA_UNIT_DATE');const day=year+'-'+md.replace('/','-');
    const dateProof=typeof dateEvidenceText==='string'&&createHash('sha256').update(dateEvidenceText).digest('hex')===dateEvidenceHash&&dateEvidenceText.includes('https://freesis.kofia.or.kr/stat/main.do')&&dateEvidenceText.includes('['+day+'] 신용공여통계관리');
    invariant(date(day)&&(html.includes(day)||dateProof)&&day<=meta.observedAt.slice(0,10),'KOFIA_YEAR_NOT_CONFIRMED');
    const value=flowNumber(b.match(/class="num1">([^<]+)</)?.[1]),change=flowNumber(b.match(/class="num2[ab]">([^<]+)</)?.[1]);invariant(value>=0,'KOFIA_BALANCE');
    out.push({factorId,scope:'market',name,date:day,value,unit:'KRW_million',change,series,...structuredClone(meta),dateEvidenceHash:dateProof?dateEvidenceHash:null,pointInTimeVerified:false,usedInForecast:false,evidenceType:'market_aggregate_balance',companySpecific:false});
  }return out;
}

export const FLOW_PUBLIC_ROUTES=Object.freeze([
 {id:'nps-domestic-holdings-index',url:'https://fund.nps.or.kr/oprtprcn/ivsmprcn/getOHED0003M0.do',kind:'text'},
 {id:'kofia-funds-summary',url:'https://freesis.kofia.or.kr/stat/main.do',kind:'text'}
]);
/** Auth-free published pages only. Caller stores the bytes by hash and keeps previous successful observations.
 * Failure/HTML error pages remain failed. No login, cookie replay, IP rotation or endpoint guessing.
 */
export async function collectFlowSources({fetchImpl=globalThis.fetch,now=()=>new Date().toISOString(),timeoutMs=12000,maxBytes=2_000_000,onRaw=async()=>{}}={}){
 const results=await Promise.all(FLOW_PUBLIC_ROUTES.map(async r=>{
   const startedAt=now();try{
     const response=await fetchImpl(r.url,{redirect:'error',signal:AbortSignal.timeout(timeoutMs)});
     invariant(response.ok,'HTTP_'+response.status);const declared=Number(response.headers.get('content-length'));
     invariant(!Number.isFinite(declared)||declared<=maxBytes,'FLOW_BODY_TOO_LARGE');
     const reader=response.body.getReader(),parts=[];let size=0;
     for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw Error('FLOW_BODY_TOO_LARGE');}parts.push(Buffer.from(value));}
     const bytes=Buffer.concat(parts),rawHash=createHash('sha256').update(bytes).digest('hex');const text=bytes.toString('utf8');
     invariant(!/에러가 발생하였습니다|접근이 제한|Access Denied/i.test(text),'FLOW_REMOTE_ERROR_PAGE');
     invariant(r.id.startsWith('nps')?text.includes('국내주식')&&text.includes('fileDown.do'):text.includes('투자자예탁금')&&text.includes('OS0026'),'FLOW_UNEXPECTED_BODY');
     const observedAt=now();await onRaw({id:r.id,sourceUrl:r.url,startedAt,observedAt,rawHash,bytes});
     return {id:r.id,sourceUrl:r.url,startedAt,observedAt,rawHash,bytes:size,status:'raw_acquired',predictiveReady:false};
   }catch(e){return {id:r.id,sourceUrl:r.url,startedAt,observedAt:now(),status:'failed',error:String(e?.message??e),predictiveReady:false};}
 }));
 return {schema:'atlas-flow-collection-1',results,exitCode:results.some(r=>r.status==='failed')?2:0,newApprovedFactorRecords:0};
}

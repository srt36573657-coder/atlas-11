import {sha256} from './cycle-math.mjs';
import {validBenchmarkDate} from './benchmark-score.mjs';

// One bounded attempt to the provider's public daily table. This route is not
// guaranteed to remain available; redirects/schema changes fail closed.
export const NAVER_KOSPI_DAILY_URL='https://finance.naver.com/sise/sise_index_day.naver?code=KOSPI&page=1';
const limit=1024*1024;
const plain=s=>s.replace(/<[^>]*>/g,'').replace(/&nbsp;|&#160;/g,' ').trim();
const positive=n=>typeof n==='number'&&Number.isFinite(n)&&n>0;
function requestURL(value) {return value===NAVER_KOSPI_DAILY_URL;}
export function parseNaverBenchmark(raw,{sessions,origin,end,cutoff,observedAt,sourceUrl=NAVER_KOSPI_DAILY_URL}={}) {
  if(typeof raw!=='string'||new TextEncoder().encode(raw).length>limit)throw Error('BENCHMARK_RESPONSE_SIZE_INVALID');
  if(!requestURL(sourceUrl)||![origin,end,cutoff].every(validBenchmarkDate)||origin>end||!Array.isArray(sessions)||sessions.some(d=>!validBenchmarkDate(d)))throw Error('BENCHMARK_REQUEST_CONTRACT_INVALID');
  if(typeof observedAt!=='string'||!/(Z|[+-]\d{2}:\d{2})$/.test(observedAt)||!Number.isFinite(Date.parse(observedAt)))throw Error('BENCHMARK_OBSERVATION_TIME_INVALID');
  if(!/code(?:=|%3D)KOSPI(?:&|%26|["'\s>])/i.test(raw))throw Error('BENCHMARK_RESPONSE_IDENTITY_MISSING');
  const allowed=new Set(sessions),found=new Map();
  for(const match of raw.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)) {
    const cells=[...match[1].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td\s*>/gi)];
    const idx=cells.findIndex(c=>/\bclass\s*=\s*["'][^"']*\bdate\b/i.test(c[1]));
    if(idx<0)continue;
    const rawDate=plain(cells[idx][2]);
    if(!/^\d{4}\.\d{2}\.\d{2}$/.test(rawDate))throw Error('BENCHMARK_DATE_FORMAT_INVALID');
    const date=rawDate.replaceAll('.','-');
    if(!validBenchmarkDate(date))throw Error('BENCHMARK_DATE_INVALID');
    if(date<origin||date>end||date>cutoff)continue;
    if(!allowed.has(date))throw Error('BENCHMARK_NON_SESSION');
    if(!cells[idx+1])throw Error('BENCHMARK_CLOSE_MISSING');
    const text=plain(cells[idx+1][2]);
    if(!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(text))throw Error('BENCHMARK_CLOSE_FORMAT_INVALID');
    const close=Number(text.replaceAll(',',''));
    if(!positive(close))throw Error('BENCHMARK_CLOSE_INVALID');
    if(Date.parse(observedAt)<Date.parse(date+'T15:30:00+09:00'))throw Error('BENCHMARK_NOT_CLOSED');
    if(found.has(date))throw Error(found.get(date).close===close?'BENCHMARK_DUPLICATE_DATE':'BENCHMARK_CONFLICTING_DATE');
    found.set(date,{code:'KOSPI',date,close,observedAt,source:{provider:'NAVER',url:sourceUrl},sourceSha256:sha256(raw),quality:'single_source',vintageVerified:false});
  }
  if(!found.size)throw Error('BENCHMARK_NO_ELIGIBLE_ROWS');
  return [...found.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
async function readBounded(response,signal) {
  if(Number(response.headers?.get?.('content-length'))>limit)throw Error('BENCHMARK_RESPONSE_TOO_LARGE');
  if(!response.body?.getReader){const raw=await response.text();if(new TextEncoder().encode(raw).length>limit)throw Error('BENCHMARK_RESPONSE_TOO_LARGE');return raw;}
  const reader=response.body.getReader(),parts=[];let size=0;
  try {for(;;){if(signal.aborted)throw Error('BENCHMARK_TIMEOUT');const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit)throw Error('BENCHMARK_RESPONSE_TOO_LARGE');parts.push(value);}}
  catch(e){await reader.cancel().catch(()=>{});throw e;}
  finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let i=0;for(const part of parts){bytes.set(part,i);i+=part.length;}
  // All date/price/identity fields use ASCII in both EUC-KR and UTF-8.
  return new TextDecoder().decode(bytes);
}
export async function collectBenchmark(previous={code:'KOSPI',prices:[],collectionLogs:[]},{now=new Date(),fetcher=fetch,sessions,origin='2026-09-17',end='2026-10-30',timeoutMs=8000}={}) {
  if(!(now instanceof Date)||!Number.isFinite(now.getTime())||!Number.isFinite(timeoutMs)||timeoutMs<1||timeoutMs>30000)throw Error('BENCHMARK_RUNTIME_CONTRACT_INVALID');
  if(!Array.isArray(sessions)||!sessions.length||sessions.some(d=>!validBenchmarkDate(d))||new Set(sessions).size!==sessions.length||![origin,end].every(validBenchmarkDate)||origin>end)throw Error('BENCHMARK_CALENDAR_INVALID');
  const benchmark=structuredClone(previous),at=now.toISOString(),log={at,provider:'NAVER',url:NAVER_KOSPI_DAILY_URL,status:'failed',attempts:0,addedRows:0,reusedRows:0,partial:true,exitCode:2,missingDates:[],sourceVerifiedTwice:false};
  if(benchmark?.code!=='KOSPI'||!Array.isArray(benchmark.prices)||!Array.isArray(benchmark.collectionLogs))throw Error('BENCHMARK_PREVIOUS_CONTRACT_INVALID');
  const invalidPrevious=benchmark.prices.some(p=>!p||!validBenchmarkDate(p.date)||!positive(p.close)||(p.code&&p.code!=='KOSPI'));
  if(invalidPrevious||new Set(benchmark.prices.map(p=>p.date)).size!==benchmark.prices.length){log.reason='기존 코스피 가격 형식·중복 확인 필요 · 원본 보존';log.error='BENCHMARK_PREVIOUS_ROWS_INVALID';benchmark.collectionLogs.push(log);return {benchmark,log,exitCode:2};}
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(now);
  const available=sessions.filter(d=>d>=origin&&d<=end&&Date.parse(d+'T16:00:00+09:00')<=now.getTime()).sort();
  const cutoff=available.at(-1);
  if(today>end){log.status='period_complete';log.reason='고정 기간 종료 · 수집하지 않음';log.partial=false;log.exitCode=0;benchmark.collectionLogs.push(log);return {benchmark,log,exitCode:0};}
  if(!cutoff){log.reason='확정 종가 수집 가능 거래일 없음';benchmark.collectionLogs.push(log);return {benchmark,log,exitCode:2};}
  const controller=new AbortController();let timer;
  try {
    log.attempts=1;
    const work=(async()=>{
      const response=await fetcher(NAVER_KOSPI_DAILY_URL,{signal:controller.signal,redirect:'error',headers:{Accept:'text/html'}});
      if(!response.ok)throw Error('BENCHMARK_HTTP_'+response.status);
      if(response.url&&!requestURL(response.url))throw Error('BENCHMARK_RESPONSE_URL_MISMATCH');
      const raw=await readBounded(response,controller.signal);
      return {raw,rows:parseNaverBenchmark(raw,{sessions,origin,end,cutoff,observedAt:at})};
    })();
    const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('BENCHMARK_TIMEOUT'));},timeoutMs);});
    const {raw,rows}=await Promise.race([work,deadline]);
    log.responseSha256=sha256(raw);log.parsedRows=rows.length;
    const conflicts=[];
    for(const row of rows){
      const old=benchmark.prices.filter(p=>p.date===row.date);
      if(old.length>1||old.length===1&&old[0].close!==row.close)conflicts.push({date:row.date,observedAt:at,before:structuredClone(old),after:structuredClone(row),resolved:false});
    }
    if(conflicts.length){benchmark.conflicts=[...(benchmark.conflicts??[]),...conflicts];throw Error('BENCHMARK_EXISTING_PRICE_CONFLICT');}
    for(const row of rows){if(benchmark.prices.some(p=>p.date===row.date))log.reusedRows++;else{benchmark.prices.push(row);log.addedRows++;}}
    benchmark.prices.sort((a,b)=>a.date.localeCompare(b.date));
    log.missingDates=available.filter(d=>benchmark.prices.filter(p=>p.date===d&&positive(p.close)).length!==1);
    log.unresolvedConflicts=(benchmark.conflicts??[]).filter(c=>available.includes(c.date)&&c.resolved!==true).length;
    log.partial=log.missingDates.length>0||log.unresolvedConflicts>0;log.exitCode=log.partial?2:0;log.status=log.partial?'partial':'complete';
    log.reason=log.partial?'공개 최신 일별표 수집 · 과거 거래일 누락 또는 가격 충돌 미해결':'요청 거래일 종가 확보 · 단일 제공자·당시 빈티지 미검증';
    benchmark.actualAsOf=benchmark.prices.at(-1)?.date??null;
  } catch(error) {
    log.error=String(error?.message??error).slice(0,240);log.reason='마지막 정상 코스피 자료 보존 · 수집 또는 검증 실패';
    log.missingDates=available.filter(d=>!benchmark.prices.some(p=>p.date===d&&positive(p.close)));
  } finally {clearTimeout(timer);}
  benchmark.collectionLogs.push(log);
  return {benchmark,log,exitCode:log.exitCode};
}
